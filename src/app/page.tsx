"use client"; // This is a client component

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import axios from "axios";
import IDL from "../idl/pork_staking.json";
import {
  Program,
  AnchorProvider,
  setProvider,
  getProvider,
  Idl,
  utils,
  BN,
  Provider,
} from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  PROGRAM_ID,
  PORK_MINT,
  TREASURY_ADDRESS,
  DECIMALS,
} from "@/utils/constants";

import {
  calculateRewards,
  showAddress,
  calculateBiggerHolderRewards,
} from "@/utils/helpers";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Main() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [referalLink, setReferalLink] = useState("");
  const [depositAmount, setDepositAmount] = useState("0");
  const [referrals, setReferrals] = useState<Array<any>>([]);

  const [refetch, setRefetch] = useState(false);

  const [porkDeposit, setPorkDeposit] = useState(0);
  const [earnedYield, setEarnedYield] = useState(0);
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [dailyBonus, setDailyBonus] = useState(0);

  const [tokenTVL, setTokenTVL] = useState(0);
  const [loading, setLoading] = useState(false);

  const [tokenPrice, setTokenPrice] = useState(0);
  const [tokenSupply, setTokenSupply] = useState(0);

  const wallet = useAnchorWallet();
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const router = useRouter();
  const searchParams = useSearchParams();
  const referrer = searchParams.get("ref");

  const [program, setProgram] = useState<Program>();

  useEffect(() => {
    if (wallet && referrer == wallet?.publicKey.toBase58()) {
      router.push("/");
    }
  }, [referrer, wallet]);

  useEffect(() => {
    if (wallet) {
      setReferalLink(
        `https://pork.finance?ref=${wallet?.publicKey?.toBase58()}`
      );

      (async function () {
        try {
          let provider: Provider;

          try {
            provider = getProvider();
          } catch {
            provider = new AnchorProvider(connection, wallet, {});
            setProvider(provider);
          }

          const program = new Program(IDL as Idl, PROGRAM_ID);
          setProgram(program);

          const { data } = await axios.get(
            `${
              process.env.NEXT_PUBLIC_BACKEND_API
            }/api/referral?ref=${wallet?.publicKey?.toBase58()}`
          );

          setReferrals(data.referrals);
        } catch (err) {}
      })();
    }
  }, [wallet]);

  useEffect(() => {
    updateInfo();
  }, [wallet, program, refetch]);

  // useEffect(() => {
  //   (async function () {
  //     try {
  //       const { data } = await axios.get(
  //         `${process.env.NEXT_PUBLIC_BACKEND_API}/api/market-data`
  //       );
  //       setTokenPrice(data.price);
  //       setTokenSupply(data.supply);
  //     } catch (err) {
  //       setTokenPrice(0);
  //       setTokenSupply(0);
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    const interval = setInterval(updateInfo, 60000);

    return () => clearInterval(interval);
  }, []);

  const initilize = async () => {
    if (program && wallet) {
      try {
        const [porkStake, bump] = await PublicKey.findProgramAddress(
          [Buffer.from(utils.bytes.utf8.encode("pork"))],
          program.programId
        );

        const stakeAta = getAssociatedTokenAddressSync(
          PORK_MINT,
          porkStake,
          true
        );

        console.log(PORK_MINT?.toBase58());
        const transaction = await program.methods
          .initialize()
          .accounts({
            porkMint: PORK_MINT,
            from: wallet.publicKey,
            porkStake: porkStake,
            stakeAta: stakeAta,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .transaction();

        await sendTransaction(transaction, connection);

        console.log(
          `https://solscan.io/token/tx/${transaction}?cluster=devnet`
        );
      } catch (err) {
        console.error(err);
      }
    }
  };
  const updateInfo = async () => {
    if (wallet && program) {
      setLoading(true);

      let staked = 0;

      try {
        const [porkStake] = await PublicKey.findProgramAddress(
          [Buffer.from(utils.bytes.utf8.encode("pork"))],
          program.programId
        );

        const stakeData = await program.account.porkStake.fetch(porkStake);
        staked = stakeData.totalAmount.div(DECIMALS).toNumber();

        setTokenTVL(staked);
      } catch (err) {
        // console.error(err);
      }
      try {
        const [walletUser] = await PublicKey.findProgramAddress(
          [
            Buffer.from(utils.bytes.utf8.encode("porkuser")),
            wallet.publicKey.toBuffer(),
          ],
          program.programId
        );

        const userData = await program.account.porkUser.fetch(walletUser);

        const deposited = userData.depostedAmount.div(DECIMALS).toNumber();

        const lastDepositedTimestamp = userData.lastDepositTimestamp.toNumber();
        let claimableAmount = userData.claimableAmount.div(DECIMALS).toNumber();
        const biggerHolderTimestamp = userData.biggerHolderTimestamp.toNumber();
        const timesOfBiggerHolder = userData.timesOfBiggerHolder.toNumber();

        const currentTimestamp = Math.floor(new Date().getTime() / 1000);

        if (timesOfBiggerHolder > 0) {
          const rewards = calculateBiggerHolderRewards(
            staked,
            timesOfBiggerHolder,
            biggerHolderTimestamp,
            currentTimestamp
          );
          claimableAmount += rewards;
          console.log(rewards);
          setDailyBonus(rewards);
        }

        claimableAmount += calculateRewards(
          deposited,
          lastDepositedTimestamp,
          currentTimestamp
        );

        setEarnedYield(userData.claimedAmount.div(DECIMALS).toNumber());
        setPorkDeposit(deposited);
        setClaimableAmount(claimableAmount);
      } catch (err) {
        // console.error(err);
      }

      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!wallet || !program) {
      return;
    }

    const amount = parseFloat(depositAmount);

    if (!amount) {
      return;
    }

    if (amount < 10000) {
      toast.error("Minimum deposit is 10,000.", { duration: 3000 });
      return;
    }

    setLoading(true);
    setDepositModal(false);

    const walletAta = getAssociatedTokenAddressSync(
      PORK_MINT,
      wallet.publicKey
    );

    const treasuryAta = getAssociatedTokenAddressSync(
      PORK_MINT,
      TREASURY_ADDRESS
    );

    const [porkStake] = await PublicKey.findProgramAddress(
      [Buffer.from(utils.bytes.utf8.encode("pork"))],
      program.programId
    );

    const stakeAta = getAssociatedTokenAddressSync(PORK_MINT, porkStake, true);

    const [walletUser] = await PublicKey.findProgramAddress(
      [
        Buffer.from(utils.bytes.utf8.encode("porkuser")),
        wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    let referralUser: any = null;

    if (referrer) {
      [referralUser] = await PublicKey.findProgramAddress(
        [
          Buffer.from(utils.bytes.utf8.encode("porkuser")),
          new PublicKey(referrer).toBuffer(),
        ],
        program.programId
      );
    }

    let firstDeposit = false;
    try {
      const userData = await program.account.porkUser.fetch(walletUser);
    } catch (err) {
      firstDeposit = true;
    }

    try {
      const deposit = new BN(amount).mul(DECIMALS);

      const randomKp = new Keypair();

      const transaction = await program.methods
        .deposit(deposit)
        .accounts({
          porkMint: PORK_MINT,
          from: wallet.publicKey,
          fromAta: walletAta,
          porkStake: porkStake,
          stakeAta: stakeAta,
          porkUser: walletUser,
          referral: referrer ? new PublicKey(referrer) : randomKp.publicKey,
          referralUser: referralUser,
          treasuryAta: treasuryAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      await sendTransaction(transaction, connection);

      if (referrer) {
        if (firstDeposit) {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_API}/api/referral`,
            {
              referrer,
              user: wallet?.publicKey?.toBase58(),
              amount: Math.floor((amount * 95) / 500),
            }
          );
        }
      }

      toast.success("Successfully Deposited.", { duration: 3000 });
      setTimeout(() => {
        setRefetch((prev) => !prev);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to Deposit.", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!wallet || !program) {
      return;
    }

    const walletAta = getAssociatedTokenAddressSync(
      PORK_MINT,
      wallet.publicKey
    );

    const treasuryAta = getAssociatedTokenAddressSync(
      PORK_MINT,
      TREASURY_ADDRESS
    );

    const [porkStake, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(utils.bytes.utf8.encode("pork"))],
      program.programId
    );

    const stakeAta = getAssociatedTokenAddressSync(PORK_MINT, porkStake, true);

    const [walletUser] = await PublicKey.findProgramAddress(
      [
        Buffer.from(utils.bytes.utf8.encode("porkuser")),
        wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    let canClaimOrCompound = false;
    try {
      const userData = await program.account.porkUser.fetch(walletUser);
      const lastDepositedTimestamp = userData.lastDepositTimestamp.toNumber();
      const timeDiff = ((new Date()).getTime() / 1000) - lastDepositedTimestamp;
      if(timeDiff >= 3600) {
        canClaimOrCompound = true;
      }
    } catch (err) {}

    if (!canClaimOrCompound) {
      toast.error("You can claim or compound every hour.", { duration: 3000 });
      return;
    }

    setLoading(true);

    try {
      const transaction = await program.methods
        .cashout(bump)
        .accounts({
          to: wallet.publicKey,
          porkMint: PORK_MINT,
          toAta: walletAta,
          porkStake: porkStake,
          stakeAta: stakeAta,
          porkUser: walletUser,
          treasuryAta: treasuryAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      await sendTransaction(transaction, connection);
      toast.success("Successfully Claimed.", { duration: 3000 });
      setTimeout(() => {
        setRefetch((prev) => !prev);
      }, 1000);
    } catch (err) {
      toast.error("Failed to Claim.", { duration: 3000 });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompound = async () => {
    if (!wallet || !program) {
      return;
    }

    const [porkStake] = await PublicKey.findProgramAddress(
      [Buffer.from(utils.bytes.utf8.encode("pork"))],
      program.programId
    );

    const [walletUser] = await PublicKey.findProgramAddress(
      [
        Buffer.from(utils.bytes.utf8.encode("porkuser")),
        wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    let canClaimOrCompound = false;
    try {
      const userData = await program.account.porkUser.fetch(walletUser);
      const lastDepositedTimestamp = userData.lastDepositTimestamp.toNumber();
      const timeDiff = ((new Date()).getTime() / 1000) - lastDepositedTimestamp;
      if(timeDiff >= 3600) {
        canClaimOrCompound = true;
      }
    } catch (err) {}

    if (!canClaimOrCompound) {
      toast.error("You can claim or compound every hour.", { duration: 3000 });
      return;
    }

    setLoading(true);

    try {
      const transaction = await program.methods
        .compound()
        .accounts({
          signer: wallet.publicKey,
          porkStake: porkStake,
          porkUser: walletUser,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      await sendTransaction(transaction, connection);
      toast.success("Successfully Compounded.", { duration: 3000 });
      setTimeout(() => {
        setRefetch((prev) => !prev);
      }, 1000);
    } catch (err) {
      toast.error("Failed to Compound.", { duration: 3000 });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pork-background"></div>
      {loading && (
        <img src="/images/loading.gif" className="modal-center w-[80px] z-50" />
      )}
      <div
        className={
          "flex flex-col w-[380px] xl:w-[1200px] 2xl:w-[1500px] mx-auto" +
          (mobileMenu || depositModal || loading ? " blur" : "")
        }
      >
        <div className="flex justify-between h-[80px] px-[20px] sm:p-0">
          <div className="flex items-center xl:hidden">
            <Image
              src="/images/buttons/hamburger.svg"
              className="hover:cursor-pointer"
              alt="Hamburger SVG"
              width={60}
              height={60}
              onClick={() => {
                setMobileMenu(true);
              }}
            />
          </div>
          <div className="hidden xl:flex gap-[4px]">
            <Image
              src="/images/buttons/twitter.svg"
              className="hover:cursor-pointer"
              alt="Twitter SVG"
              width={60}
              height={60}
              onClick={() => {
                window.open("https://x.com/johnporksolana", "_blank");
              }}
            />
            <Image
              src="/images/buttons/telegram.svg"
              className="hover:cursor-pointer"
              alt="Telegram SVG"
              width={60}
              height={60}
              onClick={() => {
                window.open("https://t.me/johnporkwtf", "_blank");
              }}
            />
            <Image
              src="/images/buttons/website.svg"
              className="hover:cursor-pointer"
              alt="Website SVG"
              width={60}
              height={60}
              onClick={() => {
                window.open("https://johnpork.wtf", "_blank");
              }}
            />
            <Image
              src="/images/buttons/chart.svg"
              className="hover:cursor-pointer"
              alt="Chart SVG"
              width={60}
              height={60}
              onClick={() => {
                window.open(
                  "https://dexscreener.com/solana/ggt3gs7vszkkljaz3c1jhq5z5yt9mp5qn6uep7adxr2d",
                  "_blank"
                );
              }}
            />
            <div className="relative flex items-center justify-center w-[128px] hover:cursor-pointer">
              <Image
                src="/images/buttons/buy_pork.svg"
                alt="Buy Pork Token"
                className="absolute"
                width={128}
                height={60}
                onClick={() => {
                  window.open(
                    "https://jup.ag/swap/SOL-PORK_2kSmCB5PrswNvN5vrN4ayb2DnVbeFmNhX7QuHReeGKYy",
                    "_blank"
                  );
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-[4px]">
            <div className="hidden relative xl:flex items-center justify-center w-[180px] hover:cursor-pointer">
              <Image
                src="/images/buttons/deposit_pork.svg"
                alt="Deposit Pork Token"
                className="absolute"
                width={180}
                height={60}
                onClick={() => {
                  setDepositModal(true);
                }}
              />
            </div>

            <WalletMultiButtonDynamic />
          </div>
        </div>

        <div className="flex flex-col xl:flex-row content-container my-[40px] gap-[30px]">
          <div className="flex flex-col order-3 xl:order-1 gap-[12px] w-[380px] 2xl:w-[480px]">
            <div className="relative flex w-[380px] h-[255px] 2xl:w-[480px] 2xl:h-[320px] hover:cursor-pointer">
              <Image
                src="/images/affiliate_box.svg"
                alt="Affiliate Box"
                className="absolute"
                fill
              />
              <div className="text-white z-10 font-lilitaone flex flex-col items-center w-full p-[12px]">
                <div className="text-[28px] 2xl:text-[32px]">
                  INSTANT 20% REFERAL
                </div>
                <div className="text-[14px] 2xl:text-[18px] text-center px-[12px]">
                  INSTANTLY GET 20% OF THE USER'S FIRST DEPOSIT WHEN THEY USE
                  YOUR LINK TO JOIN. AVAILABLE TO WITHDRAW OR COMPOUND!
                </div>
                <input
                  type="text"
                  spellCheck={false}
                  defaultValue={referalLink}
                  className="text-black indent-2 h-[40px] w-[340px] text-[16px] 2xl:h-[56px] 2xl:w-[400px] 2xl:text-[20px] mt-[12px]"
                />

                <div className="relative w-[400px] h-[80px] mt-[12px]">
                  <Image
                    src="/images/buttons/affiliate.svg"
                    alt="Affiliate Button"
                    fill
                    className="absolute"
                    onClick={() => {
                      navigator.clipboard.writeText(referalLink);
                      toast.success("Referral Link Copied to Clipboard.", {
                        duration: 3000,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="relative flex w-[380px] h-[335px] 2xl:w-[480px] 2xl:h-[420px] hover:cursor-pointer">
              <Image
                src="/images/referral_history_area.svg"
                alt="Referal History"
                className="absolute"
                fill
              />
              <div className="w-full h-[240px] 2xl:h-[320px] overflow-y-auto mt-[72px] 2xl:mt-[84px] z-10">
                {referrals.length > 0 ? (
                  referrals.map((ref, idx) => {
                    return (
                      <div
                        className="relative flex w-[340px] h-[100px] mx-auto 2xl:w-[420px] 2xl:h-[132px] hover:cursor-pointer"
                        key={idx}
                      >
                        <Image
                          src="/images/referral_reward.svg"
                          alt="Referal Reward"
                          className="absolute"
                          fill
                        />
                        <div className="flex flex-col justify-center gap-[4px] ml-[132px] xl:ml-[150px] z-10 text-white font-lilitaone text-[14px] text-shadow">
                          <div>{ref.amount.toLocaleString()} $PORK REWARD</div>
                          <div>Wallet: {showAddress(ref.user)}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-white font-lilitaone text-[40px] 2xl:text-[48px] text-shadow h-full flex items-center justify-center">
                    No Data
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col xl:hidden order-3 justify-center items-center">
              <div className="relative flex w-[260px] h-[60px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/documentation.svg"
                  alt="Documentation"
                  className="absolute"
                  fill
                  onClick={() => {
                    window.open(
                      "https://pork-finance.gitbook.io/pork.finance",
                      "_blank"
                    );
                  }}
                />
              </div>
              <div className="relative flex w-[260px] h-[60px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/smart_contract.svg"
                  alt="Smart Contract"
                  className="absolute"
                  fill
                  onClick={() => {
                    window.open(
                      "https://pork-finance.gitbook.io/pork.finance/official-links/dapp-contract",
                      "_blank"
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col order-1 xl:order-2 gap-[12px] w-[380px] 2xl:w-[480px]">
            <div className="relative flex flex-col gap-[12px] 2xl:gap-[20px] items-center w-[380px] h-[380px] 2xl:w-[480px] 2xl:h-[480px] hover:cursor-pointer">
              <Image
                src="/images/main_area.svg"
                alt="Main Area"
                className="absolute"
                fill
              />
              <div className="relative flex justify-center items-center w-[320px] h-[88px] 2xl:w-[380px] 2xl:h-[100px] hover:cursor-pointer mt-[120px] 2xl:mt-[160px]">
                <Image
                  src="/images/buttons/pork_yield_background.svg"
                  alt="Pork Yield Background"
                  className="absolute"
                  fill
                />
                <span className="text-white font-lilitaone text-[48px] z-10 text-shadow">
                  {claimableAmount.toLocaleString()}
                </span>
              </div>
              <div className="relative flex w-[340px] h-[62px] 2xl:w-[420px] 2xl:h-[80px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/claim_pork.svg"
                  alt="Claim Pork"
                  className="absolute"
                  fill
                  onClick={() => {
                    handleClaim();
                  }}
                />
              </div>
              <div className="relative flex w-[340px] h-[62px] 2xl:w-[420px] 2xl:h-[80px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/compound_gains.svg"
                  alt="Compound Gains"
                  className="absolute"
                  fill
                  onClick={() => {
                    // initilize();
                    handleCompound();
                  }}
                />
              </div>
            </div>
            <div className="relative flex justify-center w-[380px] h-[180px] 2xl:w-[480px] 2xl:h-[220px] hover:cursor-pointer">
              <Image
                src="/images/daily_bonus.svg"
                alt="Main Area"
                className="absolute"
                fill
              />
              <span className="text-white font-lilitaone text-[24px] z-10 text-shadow mt-[60px] 2xl:mt-[80px]">
                {dailyBonus == 0
                  ? "LOCKED"
                  : `${dailyBonus.toLocaleString()} $PORK`}
              </span>
            </div>
            <div className="relative xl:hidden flex w-[380px] h-[240px]">
              <Image
                src="/images/modal/pop_up.svg"
                alt="Pop Up"
                className="absolute"
                fill
              />
              <div className="text-white z-10 font-lilitaone flex flex-col items-center w-full p-[12px]">
                <div className="text-[26px]">Deposit $PORK</div>
                <input
                  type="text"
                  spellCheck={false}
                  placeholder="Enter $PORK Amount"
                  className="text-black indent-2 h-[50px] w-[340px] text-[20px] mt-[12px]"
                  onChange={(e) => {
                    setDepositAmount(e.target.value);
                  }}
                />
                <div className="flex gap-[12px] mt-[12px]">
                  <Image
                    src="/images/modal/deposit_pork.svg"
                    alt="Deposit"
                    className="hover:cursor-pointer"
                    width={166}
                    height={60}
                    onClick={() => {
                      console.log("kkkk");
                      handleDeposit();
                    }}
                  />
                  <Image
                    src="/images/modal/buy_pork.svg"
                    alt="Buy"
                    className="hover:cursor-pointer"
                    width={166}
                    height={60}
                    onClick={() => {
                      window.open(
                        "https://jup.ag/swap/SOL-PORK_2kSmCB5PrswNvN5vrN4ayb2DnVbeFmNhX7QuHReeGKYy",
                        "_blank"
                      );
                    }}
                  />
                </div>
                <span className="text-[10px] text-center font-thin">
                  Text: 2% daily claimable and compoundable yield based on $PORK
                  deposited. Deposits are non-withdrawable.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col order-2 xl:order-3 gap-[12px] w-[380px] 2xl:w-[480px]">
            <div className="relative flex order-2 xl:order-1 w-[380px] h-[128px] 2xl:w-[480px] 2xl:h-[160px] hover:cursor-pointer">
              <Image
                src="/images/instructions_area.svg"
                alt="Main Area"
                className="absolute"
                fill
              />
            </div>
            <div className="relative flex flex-col order-1 xl:order-2 w-[380px] h-[420px] 2xl:w-[480px] 2xl:h-[530px] hover:cursor-pointer">
              <Image
                src="/images/statistics_area.svg"
                alt="Main Area"
                className="absolute"
                fill
              />
              <span className="text-white font-lilitaone text-[20px] z-10 ml-[76px] mt-[82px] 2xl:ml-[96px] 2xl:mt-[108px]">
                {earnedYield.toLocaleString()} $PORK
              </span>
              <span className="text-white font-lilitaone text-[20px] z-10 ml-[76px] mt-[38px] 2xl:ml-[96px] 2xl:mt-[56px]">
                {porkDeposit.toLocaleString()} $PORK
              </span>
              <span className="text-white font-lilitaone text-[20px] z-10 ml-[76px] mt-[38px] 2xl:ml-[96px] 2xl:mt-[56px]">
                {tokenTVL.toLocaleString()} $PORK
              </span>
              <span className="text-white font-lilitaone text-[20px] z-10 ml-[76px] mt-[38px] 2xl:ml-[96px] 2xl:mt-[56px]">
                {tokenPrice}
              </span>
              <span className="text-white font-lilitaone text-[20px] z-10 ml-[76px] mt-[38px] 2xl:ml-[96px] 2xl:mt-[56px]">
                $ {(tokenPrice * tokenSupply).toLocaleString()}
              </span>
            </div>
            <div className="hidden xl:flex order-3 justify-center">
              <div className="relative flex w-[180px] h-[28px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/documentation.svg"
                  alt="Documentation"
                  className="absolute"
                  fill
                  onClick={() => {
                    window.open(
                      "https://pork-finance.gitbook.io/pork.finance",
                      "_blank"
                    );
                  }}
                />
              </div>
              <div className="relative flex w-[180px] h-[28px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/smart_contract.svg"
                  alt="Smart Contract"
                  className="absolute"
                  fill
                  onClick={() => {
                    window.open(
                      "https://pork-finance.gitbook.io/pork.finance/official-links/dapp-contract",
                      "_blank"
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {depositModal && (
        <div className="hidden xl:block modal-center z-20">
          <div className="relative flex w-[380px] h-[240px]">
            <Image
              src="/images/modal/close_pop_up.svg"
              alt="Close Pop Up"
              className="absolute right-0 top-0 z-[60] hover:cursor-pointer"
              width={40}
              height={40}
              onClick={() => {
                setDepositModal(false);
              }}
            />
            <Image
              src="/images/modal/pop_up.svg"
              alt="Pop Up"
              className="absolute"
              fill
            />
            <div className="text-white z-10 font-lilitaone flex flex-col items-center w-full p-[12px]">
              <div className="text-[26px]">Deposit $PORK</div>
              <input
                type="text"
                spellCheck={false}
                placeholder="Enter $PORK Amount"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value);
                }}
                className="text-black indent-2 h-[50px] w-[340px] text-[20px] mt-[12px]"
              />
              <div className="flex gap-[12px] mt-[12px]">
                <Image
                  src="/images/modal/deposit_pork.svg"
                  alt="Deposit"
                  className="hover:cursor-pointer"
                  width={166}
                  height={60}
                  onClick={() => {
                    handleDeposit();
                  }}
                />
                <Image
                  src="/images/modal/buy_pork.svg"
                  alt="Buy"
                  className="hover:cursor-pointer"
                  width={166}
                  height={60}
                  onClick={() => {
                    window.open(
                      "https://jup.ag/swap/SOL-PORK_2kSmCB5PrswNvN5vrN4ayb2DnVbeFmNhX7QuHReeGKYy",
                      "_blank"
                    );
                  }}
                />
              </div>
              <span className="text-[10px] text-center font-thin">
                Text: 2% daily claimable and compoundable yield based on $PORK
                deposited. Deposits are non-withdrawable.
              </span>
            </div>
          </div>
        </div>
      )}

      {mobileMenu && (
        <div className="xl:hidden modal-center z-20">
          <div className="relative flex w-[380px] h-[540px]">
            <Image
              src="/images/modal/close_pop_up.svg"
              alt="Close Pop Up"
              className="absolute right-0 top-0 z-[60] hover:cursor-pointer"
              width={40}
              height={40}
              onClick={() => {
                setMobileMenu(false);
              }}
            />
            <Image
              src="/images/modal/mobile_pop_up.svg"
              alt="Pop Up"
              className="absolute"
              fill
            />
            <div className="z-10 flex flex-col items-center w-full gap-[40px] mt-[160px]">
              <div className="flex gap-[40px]">
                <Image
                  src="/images/buttons/twitter.svg"
                  className="hover:cursor-pointer"
                  alt="Twitter SVG"
                  width={60}
                  height={60}
                  onClick={() => {
                    window.open("https://x.com/johnporksolana", "_blank");
                  }}
                />
                <Image
                  src="/images/buttons/telegram.svg"
                  className="hover:cursor-pointer"
                  alt="Telegram SVG"
                  width={60}
                  height={60}
                  onClick={() => {
                    window.open("https://t.me/johnporkwtf", "_blank");
                  }}
                />
              </div>
              <div className="flex gap-[40px]">
                <Image
                  src="/images/buttons/website.svg"
                  className="hover:cursor-pointer"
                  alt="Website SVG"
                  width={60}
                  height={60}
                  onClick={() => {
                    window.open("https://johnpork.wtf/", "_blank");
                  }}
                />
                <Image
                  src="/images/buttons/chart.svg"
                  className="hover:cursor-pointer"
                  alt="Chart SVG"
                  width={60}
                  height={60}
                  onClick={() => {
                    window.open(
                      "https://dexscreener.com/solana/ggt3gs7vszkkljaz3c1jhq5z5yt9mp5qn6uep7adxr2d",
                      "_blank"
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
