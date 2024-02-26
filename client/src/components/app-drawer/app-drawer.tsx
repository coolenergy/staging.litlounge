import { Dialog, Transition } from "@headlessui/react";
import * as hi24o from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import Link from "next/link";
import { Fragment, useState } from "react";
import AppContext from "~/components/app-context";
import DarkModeToggle from "~/components/dark-mode-toggle";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import { localStorageHooks } from "~/hooks/local-storage-hooks";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { paths } from "~/utils/paths";

function LogInLogOutButton({ setDrawerOpen }: { setDrawerOpen: (value: boolean) => void }) {
  const app = useContextOrThrow(AppContext);
  const [_, setJwt] = localStorageHooks.useJwt();
  const { data: me } = apiQueryHooks.useMe();
  return (
    <button
      className={clsx(
        "w-full rounded-full",
        me == null && "bg-my-purple",
        "py-2 text-center",
        me == null && "use-shadow-bright",
        "focus-visible:use-outline"
      )}
      onClick={() => {
        if (me) {
          setJwt("");
        } else {
          app.setLoginDialogOpen(true);
        }
        setDrawerOpen(false);
      }}
    >
      {me ? "Log out" : "Log in"}
    </button>
  );
}

function AppDrawer() {
  const [isAgreed] = localStorageHooks.useIsAgreed();
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 xl:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div
                    className={clsx(
                      "absolute inset-0",
                      "flex flex-col items-center",
                      "use-no-scrollbar overflow-y-scroll",
                      "rounded-r-24 text-lg font-medium",
                      "px-12 pt-2 pb-6",
                      "bg-white/95 dark:bg-my-background/95",
                      "text-[#100031] dark:text-white"
                    )}
                  >
                    <Link
                      href="/"
                      className="h-56 w-56"
                      tabIndex={-1}
                      onClick={() => setOpen(false)}
                    >
                      <img src="/logo.png" alt="" />
                    </Link>
                    <div
                      className={clsx(
                        "mb-9 w-full flex-col items-center gap-3",
                        isAgreed === true ? "flex" : "hidden"
                      )}
                    >
                      <Link
                        href="/"
                        className={clsx(
                          "focus-visible:use-outline",
                          "w-full rounded-full py-2 text-center"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        href={paths.models}
                        className={clsx(
                          "focus-visible:use-outline",
                          "w-full rounded-full py-2 text-center"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        Browse
                      </Link>
                      <LogInLogOutButton setDrawerOpen={setOpen} />
                    </div>
                    <div className="flex flex-col items-center gap-5">
                      <span>Theme</span>
                      <DarkModeToggle />
                    </div>
                    <div className="grow" />
                    <div className="flex w-full flex-col items-center text-sm">
                      <Link
                        href={paths.termsAndConditions}
                        className="w-full py-3 text-center outline-none"
                        tabIndex={-1}
                        onClick={() => setOpen(false)}
                      >
                        Terms and Conditions
                      </Link>
                      <Link
                        href={paths.privacyPolicy}
                        className="w-full py-3 text-center outline-none"
                        tabIndex={-1}
                        onClick={() => setOpen(false)}
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        href={paths.about}
                        className="w-full py-3 text-center outline-none"
                        tabIndex={-1}
                        onClick={() => setOpen(false)}
                      >
                        About
                      </Link>
                    </div>
                  </div>
                </Transition.Child>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <button
        type="button"
        className={clsx(
          "focus-visible:use-outline",
          "xl:hidden",
          "absolute left-4 top-6",
          "h-12 w-12 rounded-10"
        )}
        onClick={() => setOpen(true)}
      >
        <hi24o.Bars3Icon className="h-full w-full stroke-white" />
      </button>
    </>
  );
}

export default AppDrawer;
