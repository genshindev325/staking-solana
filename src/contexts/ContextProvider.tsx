"use client"; // This is a client component 

import { WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
	TorusWalletAdapter,
	LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';
import dynamic from "next/dynamic";
import { RPC_ENDPOINT } from '@/utils/constants';

const ReactUIWalletModalProviderDynamic = dynamic(
	async () =>
		(await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
	{ ssr: false }
);

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const { autoConnect } = useAutoConnect();
	// const { networkConfiguration } = useNetworkConfiguration();

	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
			new TorusWalletAdapter(),
			new LedgerWalletAdapter(),
		],
		[]
	);

	const onError = useCallback(
		(error: WalletError) => {
			console.error(error);
		},
		[]
	);

	return (
		<ConnectionProvider endpoint={RPC_ENDPOINT}>
			<WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
				<ReactUIWalletModalProviderDynamic>
					{children}
				</ReactUIWalletModalProviderDynamic>
			</WalletProvider>
		</ConnectionProvider>
	);
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
	return (
		<>
			<NetworkConfigurationProvider>
				<AutoConnectProvider>
					<WalletContextProvider>{children}</WalletContextProvider>
				</AutoConnectProvider>
			</NetworkConfigurationProvider>
		</>
	);
};
