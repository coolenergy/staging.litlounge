import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import AppContext from "~/components/app-context";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import { localStorageHooks } from "~/hooks/local-storage-hooks";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { Me } from "~/utils/api";
import { consts } from "~/utils/consts";
import { paths } from "~/utils/paths";
import SearchSvg from "./search.svg";
import TokenSvg from "./token.svg";

function ModelsSearch() {
  const app = useContextOrThrow(AppContext);
  return (
    <div className="relative flex grow items-center justify-end">
      <input
        value={app.searchQuery}
        placeholder="Search"
        className={clsx(
          "focus-visible:use-outline",
          "w-12 xl:w-auto",
          "grow placeholder-shown:grow-0 focus:placeholder-shown:grow xl:placeholder-shown:grow",
          "rounded-10",
          "bg-white placeholder-shown:bg-transparent focus:placeholder-shown:bg-white xl:placeholder-shown:bg-white",
          "text-14 3xl:text-20",
          "text-my-dark",
          "px-4 py-2.5 xl:py-1 3xl:py-2",
          "transition-all",
          "placeholder:invisible placeholder:focus:visible xl:placeholder:visible"
        )}
        onChange={(event) => {
          app.setSearchQuery(event.target.value);
        }}
      />
      <div
        className={clsx(
          "pointer-events-none",
          "absolute inset-y-0 right-0 mr-2.5",
          "flex xl:hidden",
          "items-center"
        )}
      >
        <SearchSvg className="h-7 w-7" />
      </div>
    </div>
  );
}

function MyTokensButton({ me }: { me: Me }) {
  const app = useContextOrThrow(AppContext);
  return (
    <button
      className={clsx(
        "use-shadow focus-visible:use-outline",
        "flex",
        "h-6 xl:h-8",
        "xl:-skew-x-6",
        "items-center gap-2",
        "rounded-15 xl:rounded-3",
        "bg-my-purple px-2",
        "text-13 3xl:text-20"
      )}
      onClick={() => {
        app.openBuyTokensDialog();
      }}
    >
      <TokenSvg className="h-4 w-4" />
      {me.stats?.totalTokenEarned} Tokens
    </button>
  );
}

function MyAvatarButton({ me }: { me: Me }) {
  const app = useContextOrThrow(AppContext);
  return (
    <button
      className={clsx(
        "focus-visible:use-outline",
        "pointer-events-none xl:pointer-events-auto",
        "h-12 w-12 xl:h-10 xl:w-10",
        "cursor-pointer rounded-full bg-my-light"
      )}
      onClick={() => {
        app.setUserMenuDialogOpen(true);
      }}
    >
      <img src={me.avatar || consts.image.nothing} alt="" />
    </button>
  );
}

function MobileContent() {
  const router = useRouter();
  const { data: me } = apiQueryHooks.useMe();
  return (
    <div className={clsx("relative mr-4 ml-20 xl:m-0", "flex h-24 items-center justify-end gap-4")}>
      {router.pathname === paths.home && me && (
        <>
          <MyTokensButton me={me} />
          <MyAvatarButton me={me} />
        </>
      )}
      {router.pathname === paths.models && (
        <>
          <div className="absolute left-0 text-22">Models</div>
          <ModelsSearch />
        </>
      )}
    </div>
  );
}

function DesktopContent() {
  const router = useRouter();
  const app = useContextOrThrow(AppContext);
  const [isAgreed] = localStorageHooks.useIsAgreed();
  const { data: me } = apiQueryHooks.useMe();
  return (
    <div className="mx-8 flex 3xl:mx-16">
      <Link href="/" className="-ml-8 h-52 w-52 3xl:-ml-14 3xl:h-80 3xl:w-80" tabIndex={-1}>
        <img src="/logo.png" alt="" />
      </Link>
      <div className="grow" />
      <div
        className={clsx(
          "mb-5 items-center 3xl:mb-6",
          "gap-3 3xl:gap-6",
          isAgreed === true ? "flex" : "hidden"
        )}
      >
        <div className="flex gap-1">
          <Link
            href="/"
            className={clsx(
              "focus-visible:use-outline",
              "flex h-8",
              "-skew-x-6 rounded-3",
              "text-14 3xl:text-20"
            )}
          >
            <div className={clsx("rounded-3 bg-my-purple", "py-1.5 px-7 3xl:px-10 3xl:py-2.5")}>
              <span className="inline-block skew-x-6 hover:underline">Home</span>
            </div>
            <div className="ml-1 w-1 rounded-2 bg-my-purple py-1.5" />
          </Link>
        </div>
        {router.pathname === paths.models ? (
          <ModelsSearch />
        ) : (
          <Link
            href={paths.models}
            className={clsx(
              "focus-visible:use-outline",
              "-skew-x-6 rounded-3",
              "py-1.5 px-7 3xl:px-10 3xl:py-2.5",
              "text-14 3xl:text-20"
            )}
          >
            <span className="inline-block skew-x-6 hover:underline">Browse</span>
          </Link>
        )}
        {me ? (
          <>
            <MyTokensButton me={me} />
            <MyAvatarButton me={me} />
          </>
        ) : (
          <button
            className={clsx(
              "focus-visible:use-outline",
              "-skew-x-6 rounded-3 border border-my-purple",
              "py-1.5 px-7 3xl:px-10 3xl:py-2.5",
              "text-14 3xl:text-20"
            )}
            onClick={() => {
              app.setLoginDialogOpen("asHeaderPopup");
            }}
          >
            <span className="inline-block skew-x-6 hover:underline">Login</span>
          </button>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header>
      <div className="xl:hidden">
        <MobileContent />
      </div>
      <div className="hidden xl:block">
        <DesktopContent />
      </div>
    </header>
  );
}

export default Header;
