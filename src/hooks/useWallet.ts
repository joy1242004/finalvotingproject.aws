import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  isMetaMaskInstalled: boolean;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isMetaMaskInstalled: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const checkMetaMask = useCallback(() => {
    const isInstalled = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
    setWalletState(prev => ({ ...prev, isMetaMaskInstalled: isInstalled }));
    return isInstalled;
  }, []);

  const handleAccountsChanged = useCallback((accounts: unknown) => {
    const accountsArray = accounts as string[];
    if (accountsArray.length === 0) {
      setWalletState(prev => ({
        ...prev,
        isConnected: false,
        address: null,
      }));
      toast.info('Wallet disconnected');
    } else {
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        address: accountsArray[0],
      }));
    }
  }, []);

  const handleChainChanged = useCallback((chainId: unknown) => {
    setWalletState(prev => ({
      ...prev,
      chainId: chainId as string,
    }));
  }, []);

  useEffect(() => {
    checkMetaMask();

    if (window.ethereum) {
      // Check if already connected
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts) => {
          const accountsArray = accounts as string[];
          if (accountsArray.length > 0) {
            setWalletState(prev => ({
              ...prev,
              isConnected: true,
              address: accountsArray[0],
            }));
          }
        })
        .catch(console.error);

      // Get chain ID
      window.ethereum
        .request({ method: 'eth_chainId' })
        .then((chainId) => {
          setWalletState(prev => ({
            ...prev,
            chainId: chainId as string,
          }));
        })
        .catch(console.error);

      // Set up listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkMetaMask, handleAccountsChanged, handleChainChanged]);

  // Listen for logout event to disconnect wallet
  useEffect(() => {
    const handleLogoutDisconnect = () => {
      setWalletState(prev => ({
        ...prev,
        isConnected: false,
        address: null,
      }));
    };

    window.addEventListener('wallet-disconnect', handleLogoutDisconnect);
    return () => {
      window.removeEventListener('wallet-disconnect', handleLogoutDisconnect);
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum?.isMetaMask) {
      toast.error('MetaMask is not installed. Please install it to connect your wallet.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          address: accounts[0],
        }));
        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Connection rejected. Please approve the connection in MetaMask.');
      } else {
        toast.error('Failed to connect wallet');
        console.error('Wallet connection error:', error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWalletState(prev => ({
      ...prev,
      isConnected: false,
      address: null,
    }));
    toast.info('Wallet disconnected');
  };

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    ...walletState,
    isConnecting,
    connect,
    disconnect,
    formatAddress,
  };
}
