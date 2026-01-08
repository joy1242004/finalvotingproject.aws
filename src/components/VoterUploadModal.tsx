import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Election } from '@/hooks/useElections';

interface VoterUploadModalProps {
  open: boolean;
  onClose: () => void;
  elections: Election[];
}

interface ParsedVoter {
  email: string;
  student_id?: string;
  full_name?: string;
  department?: string;
}

export function VoterUploadModal({ open, onClose, elections }: VoterUploadModalProps) {
  const [selectedElection, setSelectedElection] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedVoters, setParsedVoters] = useState<ParsedVoter[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      const voters: ParsedVoter[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const voter: ParsedVoter = { email: '' };
        
        headers.forEach((header, index) => {
          if (header === 'email') voter.email = values[index];
          if (header === 'student_id' || header === 'studentid') voter.student_id = values[index];
          if (header === 'name' || header === 'full_name') voter.full_name = values[index];
          if (header === 'department') voter.department = values[index];
        });
        
        if (voter.email) voters.push(voter);
      }
      
      setParsedVoters(voters);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedElection || parsedVoters.length === 0) return;

    setUploading(true);
    let success = 0;
    let failed = 0;

    try {
      for (const voter of parsedVoters) {
        const { error } = await supabase
          .from('eligible_voters')
          .insert({
            election_id: selectedElection,
            email: voter.email,
            student_id: voter.student_id,
            full_name: voter.full_name,
            department: voter.department,
          });

        if (error) {
          failed++;
        } else {
          success++;
        }
      }

      setUploadResult({ success, failed });
      toast.success(`Uploaded ${success} voters successfully`);
    } catch (error) {
      toast.error('Failed to upload voters');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedVoters([]);
    setSelectedElection('');
    setUploadResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Voter List</DialogTitle>
          <DialogDescription>
            Upload a CSV file with voter information. Required column: email. Optional columns: student_id, name, department.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Select Election</Label>
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an election" />
              </SelectTrigger>
              <SelectContent>
                {elections.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>CSV File</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileText className="w-8 h-8 mb-2 text-primary" />
                      <p className="text-sm text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{parsedVoters.length} voters found</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload CSV</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {parsedVoters.length > 0 && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Found {parsedVoters.length} voters in the file. Preview:
                <ul className="mt-2 text-xs space-y-1 max-h-24 overflow-y-auto">
                  {parsedVoters.slice(0, 5).map((v, i) => (
                    <li key={i}>{v.email} {v.full_name && `- ${v.full_name}`}</li>
                  ))}
                  {parsedVoters.length > 5 && (
                    <li className="text-muted-foreground">... and {parsedVoters.length - 5} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {uploadResult && (
            <Alert variant={uploadResult.failed > 0 ? 'destructive' : 'default'}>
              {uploadResult.failed > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {uploadResult.success} voters added successfully.
                {uploadResult.failed > 0 && ` ${uploadResult.failed} failed (possibly duplicates).`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedElection || parsedVoters.length === 0 || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Voters'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
