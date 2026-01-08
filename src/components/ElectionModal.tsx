import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Election, Candidate } from '@/hooks/useElections';

interface ElectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (election: any, candidates: { name: string; party: string }[]) => Promise<void>;
  election?: Election | null;
}

export function ElectionModal({ open, onClose, onSubmit, election }: ElectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<string>('upcoming');
  const [candidates, setCandidates] = useState<{ name: string; party: string }[]>([
    { name: '', party: '' },
  ]);

  useEffect(() => {
    if (election) {
      setTitle(election.title);
      setDescription(election.description || '');
      setStartDate(election.start_date.split('T')[0]);
      setEndDate(election.end_date.split('T')[0]);
      setStatus(election.status);
      setCandidates(
        election.candidates?.map(c => ({ name: c.name, party: c.party || '' })) || [{ name: '', party: '' }]
      );
    } else {
      resetForm();
    }
  }, [election, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setStatus('upcoming');
    setCandidates([{ name: '', party: '' }]);
  };

  const addCandidate = () => {
    setCandidates([...candidates, { name: '', party: '' }]);
  };

  const removeCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const updateCandidate = (index: number, field: 'name' | 'party', value: string) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(
        {
          title,
          description,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          status,
        },
        candidates.filter(c => c.name.trim())
      );
      onClose();
      resetForm();
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{election ? 'Edit Election' : 'Create New Election'}</DialogTitle>
          <DialogDescription>
            {election ? 'Update the election details below.' : 'Fill in the details to create a new election.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Election Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Student Council President 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Election description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Candidates</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCandidate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Candidate
                </Button>
              </div>
              <div className="space-y-3">
                {candidates.map((candidate, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Candidate Name"
                        value={candidate.name}
                        onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Party/Group"
                        value={candidate.party}
                        onChange={(e) => updateCandidate(index, 'party', e.target.value)}
                      />
                    </div>
                    {candidates.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCandidate(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : election ? 'Update Election' : 'Create Election'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
