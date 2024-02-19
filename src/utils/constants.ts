import { PublicKey } from "@solana/web3.js";

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC as string;

const TEAM_WALLET = new PublicKey(process.env.NEXT_PUBLIC_TEAM_WALLET as string);

const PORK_TOKEN_ADDRESS = new PublicKey('2kSmCB5PrswNvN5vrN4ayb2DnVbeFmNhX7QuHReeGKYy');

export {
  RPC_ENDPOINT,
  TEAM_WALLET,
  PORK_TOKEN_ADDRESS,
}
