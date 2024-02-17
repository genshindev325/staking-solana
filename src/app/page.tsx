"use client"; // This is a client component

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, ParsedAccountData } from "@solana/web3.js";
import axios from "axios";
import Image from "next/image";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Main() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [depositModal, setDepositModal] = useState(false);

  return (
    <div>
      <div className="pork-background"></div>
      <div
        className={
          "flex flex-col w-[380px] xl:w-[1200px] 2xl:w-[1500px] mx-auto" +
          (mobileMenu || depositModal ? " blur" : "")
        }
      >
        <div className="flex justify-between h-[80px] px-[20px] sm:p-0">
          <div className="flex xl:hidden">
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
            />
            <Image
              src="/images/buttons/telegram.svg"
              className="hover:cursor-pointer"
              alt="Twitter SVG"
              width={60}
              height={60}
            />
            <Image
              src="/images/buttons/website.svg"
              className="hover:cursor-pointer"
              alt="Twitter SVG"
              width={60}
              height={60}
            />
            <Image
              src="/images/buttons/chart.svg"
              className="hover:cursor-pointer"
              alt="Twitter SVG"
              width={60}
              height={60}
            />
            <div className="relative flex items-center justify-center w-[128px] hover:cursor-pointer">
              <Image
                src="/images/buttons/buy_pork.svg"
                alt="Buy Pork Token"
                className="absolute"
                width={128}
                height={60}
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
                  defaultValue="https://www.bminer.app?ref=3cftK6bqe6JFC4yB2MaAeCTaADgzs1F3p7eSyDoANzwS"
                  className="text-black indent-2 h-[40px] w-[340px] text-[16px] 2xl:h-[56px] 2xl:w-[400px] 2xl:text-[20px] mt-[12px]"
                />

                <div className="relative w-[400px] h-[80px] mt-[12px]">
                  <Image
                    src="/images/buttons/affiliate.svg"
                    alt="Affiliate Button"
                    fill
                    className="absolute"
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
              <div className="w-full h-[240px] 2xl:h-[320px] overflow-y-scroll mt-[72px] 2xl:mt-[84px] z-10">
                <div className="relative flex w-[340px] h-[100px] mx-auto 2xl:w-[420px] 2xl:h-[132px] hover:cursor-pointer">
                  <Image
                    src="/images/referral_reward.svg"
                    alt="Referal Reward"
                    className="absolute"
                    fill
                  />
                </div>
                <div className="relative flex w-[340px] h-[100px] mx-auto 2xl:w-[420px] 2xl:h-[132px] hover:cursor-pointer">
                  <Image
                    src="/images/referral_reward.svg"
                    alt="Referal Reward"
                    className="absolute"
                    fill
                  />
                </div>
                <div className="relative flex w-[340px] h-[100px] mx-auto 2xl:w-[420px] 2xl:h-[132px] hover:cursor-pointer">
                  <Image
                    src="/images/referral_reward.svg"
                    alt="Referal Reward"
                    className="absolute"
                    fill
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:hidden order-3 justify-center">
              <div className="relative flex w-[380px] h-[68px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/documentation.svg"
                  alt="Main Area"
                  className="absolute"
                  fill
                />
              </div>
              <div className="relative flex w-[380px] h-[68px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/smart_contract.svg"
                  alt="Main Area"
                  className="absolute"
                  fill
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
                  102,890
                </span>
              </div>
              <div className="relative flex w-[340px] h-[62px] 2xl:w-[420px] 2xl:h-[80px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/claim_pork.svg"
                  alt="Claim Pork"
                  className="absolute"
                  fill
                />
              </div>
              <div className="relative flex w-[340px] h-[62px] 2xl:w-[420px] 2xl:h-[80px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/compound_gains.svg"
                  alt="Compound Gains"
                  className="absolute"
                  fill
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
                10,289,080 $PORK
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
                  placeholder="Enter $PORK Amount"
                  className="text-black indent-2 h-[50px] w-[340px] text-[20px] mt-[12px]"
                />
                <div className="flex gap-[12px] mt-[12px]">
                  <Image
                    src="/images/modal/deposit_pork.svg"
                    alt="Deposit"
                    className="hover:cursor-pointer"
                    width={166}
                    height={60}
                  />
                  <Image
                    src="/images/modal/buy_pork.svg"
                    alt="Buy"
                    className="hover:cursor-pointer"
                    width={166}
                    height={60}
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
              <span className="text-white font-lilitaone text-[20px] z-10 text-shadow ml-[76px] mt-[82px] 2xl:ml-[96px] 2xl:mt-[108px]">
                102,890,890 $PORK
              </span>
              <span className="text-white font-lilitaone text-[20px] z-10 text-shadow ml-[76px] mt-[38px] 2xl:ml-[96px] 2xl:mt-[56px]">
                102,890,890 $PORK
              </span>
              <span className="text-white font-lilitaone text-[20px] z-10 text-shadow ml-[76px] mt-[38px] 2xl:ml-[96px] 2xl:mt-[56px]">
                102,890,890 $PORK
              </span>
              <span className="text-white font-lilitaone text-[20px] z-10 text-shadow ml-[76px] mt-[38px] 2xl:ml-[96px] 2xl:mt-[56px]">
                0.002345
              </span>
              <span className="text-white font-lilitaone text-[20px] z-10 text-shadow ml-[76px] mt-[38px] 2xl:ml-[96px] 2xl:mt-[56px]">
                $ 8,224,345
              </span>
            </div>
            <div className="hidden xl:flex order-3 justify-center">
              <div className="relative flex w-[180px] h-[28px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/documentation.svg"
                  alt="Main Area"
                  className="absolute"
                  fill
                />
              </div>
              <div className="relative flex w-[180px] h-[28px] hover:cursor-pointer">
                <Image
                  src="/images/buttons/smart_contract.svg"
                  alt="Main Area"
                  className="absolute"
                  fill
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
                placeholder="Enter $PORK Amount"
                className="text-black indent-2 h-[50px] w-[340px] text-[20px] mt-[12px]"
              />
              <div className="flex gap-[12px] mt-[12px]">
                <Image
                  src="/images/modal/deposit_pork.svg"
                  alt="Deposit"
                  className="hover:cursor-pointer"
                  width={166}
                  height={60}
                />
                <Image
                  src="/images/modal/buy_pork.svg"
                  alt="Buy"
                  className="hover:cursor-pointer"
                  width={166}
                  height={60}
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
                />
                <Image
                  src="/images/buttons/telegram.svg"
                  className="hover:cursor-pointer"
                  alt="Telegram SVG"
                  width={60}
                  height={60}
                />
              </div>
              <div className="flex gap-[40px]">
                <Image
                  src="/images/buttons/website.svg"
                  className="hover:cursor-pointer"
                  alt="Website SVG"
                  width={60}
                  height={60}
                />
                <Image
                  src="/images/buttons/chart.svg"
                  className="hover:cursor-pointer"
                  alt="Chart SVG"
                  width={60}
                  height={60}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
