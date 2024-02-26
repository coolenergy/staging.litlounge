import { clsx } from "clsx";
import Link from "next/link";
import DarkModeToggle from "~/components/dark-mode-toggle";
import PrivacyInBankStatement from "~/components/privacy-in-bank-statement";
import SecureSslEncryption from "~/components/secure-ssl-encryption";
import { paths } from "~/utils/paths";

function Footer() {
  return (
    <footer
      className={clsx("hidden h-14 w-full whitespace-nowrap xl:flex 3xl:h-16", "px-6 3xl:px-10")}
    >
      <div className="flex items-center gap-5">
        <PrivacyInBankStatement />
        <SecureSslEncryption />
        <DarkModeToggle />
      </div>
      <div className="grow" />
      <div className="flex items-center gap-8 text-xs 3xl:gap-24 3xl:text-base">
        <Link
          href={paths.termsAndConditions}
          className="outline-none hover:underline"
          tabIndex={-1}
        >
          Terms and Conditions
        </Link>
        <Link href={paths.privacyPolicy} className="outline-none hover:underline" tabIndex={-1}>
          Privacy Policy
        </Link>
        <Link href={paths.about} className="outline-none hover:underline" tabIndex={-1}>
          About
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
