import { Dialog, Transition } from "@headlessui/react";
import { clsx } from "clsx";
import { Fragment, ReactNode } from "react";
import ChevronRightSvg from "./chevron-right.svg";

export type SlideOverTransition = "entering" | "leaving" | undefined;

function SlideOver({
  children,
  open,
  setOpen,
  onTransitionStateChange,
}: {
  children?: ReactNode;
  open: boolean;
  setOpen: (value: boolean) => void;
  onTransitionStateChange?: (value: SlideOverTransition) => void;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10 text-white" onClose={setOpen}>
        <div className="fixed inset-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                beforeEnter={() => {
                  onTransitionStateChange?.("entering");
                }}
                afterEnter={() => {
                  onTransitionStateChange?.(undefined);
                }}
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
                beforeLeave={() => {
                  onTransitionStateChange?.("leaving");
                }}
                afterLeave={() => {
                  onTransitionStateChange?.(undefined);
                }}
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md bg-transparent">
                  <div className="relative flex h-full flex-col">
                    {children}
                    <button
                      className={clsx(
                        "absolute inset-y-0 left-0 -ml-4",
                        "items-center outline-none"
                      )}
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      <ChevronRightSvg className="h-4 w-4" />
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default SlideOver;
