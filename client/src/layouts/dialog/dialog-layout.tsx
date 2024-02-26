import { Dialog, Transition } from "@headlessui/react";
import { clsx } from "clsx";
import { Fragment, ReactNode } from "react";
import { chooseBy } from "~/utils/choose-by";

const className = {
  paddings: "p-7 sm:p-6",
};

export type DialogPosition = "screen" | "center" | "asHeaderPopup";

export type DialogLayoutProps = {
  children?: ReactNode;
  open: boolean;
  setOpen: (value: boolean) => void;
  position?: DialogPosition;
  width?: "content" | "sm";
  opacity?: "75" | "100";
};

function DialogLayout({
  children,
  open,
  setOpen,
  position = "center",
  width = "content",
  opacity = "100",
}: DialogLayoutProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          // Do nothing
          // We close the dialog only by the backdrop click!
          // It allows the dialog to stay open if a notification is clicked
        }}
      >
        <div className="fixed inset-0" onClickCapture={() => setOpen(false)} />
        <div className={clsx("pointer-events-none", "fixed inset-0 z-10 overflow-y-auto")}>
          <div
            className={clsx(
              "flex min-h-full",
              "items-end justify-center",
              chooseBy(position, {
                screen: "",
                center: "xl:items-center",
                asHeaderPopup: "xl:items-start xl:justify-end",
              })
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  "pointer-events-auto",
                  "relative flex flex-col overflow-hidden",
                  "transform shadow-xl transition-all",
                  position !== "screen" && [
                    "rounded-40 xl:rounded-10",
                    [
                      "w-full",
                      chooseBy(width, {
                        sm: "sm:max-w-sm",
                        content: "sm:w-fit",
                      }),
                    ],
                  ],
                  [
                    chooseBy(position, {
                      screen: "h-screen w-screen",
                      center: ["m-4", className.paddings],
                      asHeaderPopup: ["m-4 xl:mr-8 xl:mt-36 3xl:mt-52", className.paddings],
                    }),
                  ],
                  chooseBy(opacity, {
                    100: "bg-my-light dark:bg-my-dark xl:bg-white",
                    75: "bg-my-light/75 dark:bg-my-dark/75 xl:bg-white/75",
                  }),
                  "text-[#3e3d3d] dark:text-white xl:text-black xl:dark:text-white"
                )}
                onClick={() => {
                  if (position === "screen") {
                    setOpen(false);
                  }
                }}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default DialogLayout;
