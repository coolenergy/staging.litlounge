import { RadioGroup } from "@headlessui/react";
import { clsx } from "clsx";
import { useState } from "react";
import PrivacyInBankStatement from "~/components/privacy-in-bank-statement";
import SecureSslEncryption from "~/components/secure-ssl-encryption";
import DialogLayout from "~/layouts/dialog";
import { consts } from "~/utils/consts";
import { keysOf } from "~/utils/get-keys-of";
import CardAmericanExpressSvg from "./card-american-express.svg";
import CardDiscoverSvg from "./card-discover.svg";
import CardMastercardSvg from "./card-mastercard.svg";
import CardVisaSvg from "./card-visa.svg";

type OptionData = {
  text: string;
  textRight?: string;
};

type Options<OptionValue extends string> = Record<OptionValue, OptionData>;

function OptionsRadioGroup<OptionValue extends string>({
  label,
  options,
  value,
  setValue,
}: {
  label: string;
  options: Options<OptionValue>;
  value: OptionValue | undefined;
  setValue: (value: OptionValue) => void;
}) {
  return (
    <RadioGroup value={value} className="flex flex-col gap-1 text-left" onChange={setValue}>
      <RadioGroup.Label>{label}</RadioGroup.Label>
      {keysOf(options).map((value) => {
        const { text, textRight } = options[value];
        return (
          <RadioGroup.Option
            key={value}
            value={value}
            className={({ checked }) =>
              clsx(
                "focus-visible:use-outline",
                "flex grow cursor-pointer rounded-10 py-1 px-4 text-19",
                checked ? "bg-my-purple" : "bg-[#707070]"
              )
            }
          >
            <>
              <span className="grow">{text}</span>
              <span className="font-bold">{textRight == null ? "" : consts.nbsp + textRight}</span>
            </>
          </RadioGroup.Option>
        );
      })}
    </RadioGroup>
  );
}

type TokenPackage = "7500" | "20000" | "42000";

const tokenPackages: Options<TokenPackage> = {
  "7500": {
    text: "7,500 Tokens",
    textRight: "$10",
  },
  "20000": {
    text: "20,000 Tokens",
    textRight: "$20",
  },
  "42000": {
    text: "42,500 Tokens",
    textRight: "$40",
  },
};

type PaymentMethod = "paypal" | "card";

const paymentMethods: Options<PaymentMethod> = {
  paypal: {
    text: "PayPal",
  },
  card: {
    text: "Credit/Debit Card",
  },
};

function AppBuyTokensDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [tokenPackage, setTokenPackage] = useState<TokenPackage>("7500");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypal");
  return (
    <DialogLayout open={open} setOpen={setOpen}>
      <div className="flex flex-col gap-2">
        <span className="xl:hidden">Purchase Tokens</span>
        <span className="hidden text-center xl:inline">Complete your purchase</span>
        <div className="grid gap-2 xl:grid-cols-2">
          <div className="xl:col-start-2">
            <OptionsRadioGroup
              label="Token Packages"
              options={tokenPackages}
              value={tokenPackage}
              setValue={setTokenPackage}
            />
          </div>
          <div className="xl:col-start-1 xl:row-start-1">
            <OptionsRadioGroup
              label="Payment Method"
              options={paymentMethods}
              value={paymentMethod}
              setValue={setPaymentMethod}
            />
          </div>
        </div>
        <hr className="hidden xl:block" />
        <div className="grid gap-2">
          <div className={clsx("xl:row-start-2", "flex justify-center gap-2")}>
            <PrivacyInBankStatement />
            <SecureSslEncryption />
            <CardVisaSvg className="h-12 w-12" />
            <CardMastercardSvg className="h-12 w-12" />
            <CardAmericanExpressSvg className="h-12 w-12" />
            <CardDiscoverSvg className="h-12 w-12" />
          </div>
          <button
            className={clsx(
              "use-shadow focus-visible:use-outline",
              "xl:row-start-1",
              "h-8 rounded-10 bg-my-purple px-4"
            )}
            onClick={() => {
              setOpen(false);
            }}
          >
            Pay
          </button>
        </div>
      </div>
    </DialogLayout>
  );
}

export default AppBuyTokensDialog;
