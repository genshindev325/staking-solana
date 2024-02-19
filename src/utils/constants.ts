import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC as string;

const TEAM_WALLET = new PublicKey(process.env.NEXT_PUBLIC_TEAM_WALLET as string);

// const PORK_MINT = new PublicKey('2kSmCB5PrswNvN5vrN4ayb2DnVbeFmNhX7QuHReeGKYy');
const PORK_MINT = new PublicKey('Hvny3cEVRKqxHD4Gd5UAJ3pnCWF8PxSLEA1aeNyhg278');

const PROGRAM_ID = "2vuV5qE78W4gizwb7GBeyX9MtyUd1iFaeMNEYTmzWWAK";

const TREASURY_ADDRESS = new PublicKey("HMXh8po6J3c319NeqkXMrJYDJnTK69fvDhK5p6KDWLgJ");

const DECIMALS = new BN(1000_000_000);

export {
  RPC_ENDPOINT,
  TEAM_WALLET,
  PORK_MINT,
  PROGRAM_ID,
  TREASURY_ADDRESS,
  DECIMALS,
}
