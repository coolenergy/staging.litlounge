import { Transition } from "@headlessui/react";
import * as hi20s from "@heroicons/react/20/solid";
import * as hi24o from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useTimeout } from "usehooks-ts";

export type NotificationDefinition = {
  type?: "notification" | "warning";
  title: string;
  text?: string;
  durationInSeconds?: number;
};

export type NotificationState = {
  id: string;
  show: boolean;
  definition: NotificationDefinition;
};

function Notification({
  id,
  show,
  definition: {
    type = "notification",
    title,
    text,
    durationInSeconds = type === "warning" ? 0 : 5,
  },
  notifications,
  setNotifications,
}: NotificationState & {
  notifications: NotificationState[];
  setNotifications: (notifications: NotificationState[]) => void;
}) {
  function hide() {
    setNotifications(
      [...notifications].map((notification) => {
        if (notification.id === id) {
          notification.show = false;
        }
        return notification;
      })
    );
  }
  useTimeout(() => {
    if (durationInSeconds > 0) {
      hide();
    }
  }, durationInSeconds * 1000);
  return (
    <Transition
      appear={true}
      show={show}
      enter="transition ease-out duration-300"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      afterLeave={() => {
        setNotifications(notifications.filter((notification) => notification.id !== id));
      }}
      className={clsx(
        "pointer-events-auto",
        "w-full sm:max-w-sm",
        "rounded-40 xl:rounded-10",
        "bg-my-light/90 dark:bg-my-dark/90 xl:bg-white/90",
        "text-[#3e3d3d] dark:text-white xl:text-black xl:dark:text-white"
      )}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className="ml-3 w-0 flex-1 overflow-ellipsis pt-0.5">
            <p
              className={clsx("font-bold", {
                "text-red-400": type === "warning",
              })}
            >
              {title}
            </p>
            {text && (
              <p
                className={clsx(
                  "mt-1 overflow-hidden overflow-ellipsis whitespace-pre-line xl:text-sm"
                )}
              >
                {text}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className={clsx(
                "focus-visible:use-outline",
                "group inline-flex h-5 w-5 rounded-md hover:text-slate-500",
                "text-black dark:text-white"
              )}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                hide();
              }}
            >
              {durationInSeconds > 0 && (
                <hi24o.BellIcon className="h-full w-full group-hover:hidden" />
              )}
              <hi20s.XMarkIcon
                className={clsx("h-full w-full", {
                  "hidden group-hover:inline-block": durationInSeconds > 0,
                })}
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
}

type NotificationsProps = {
  notifications: NotificationState[];
  setNotifications: (notifications: NotificationState[]) => void;
};

function AppNotifications({ notifications, setNotifications }: NotificationsProps) {
  return (
    <div
      className={clsx("pointer-events-none fixed inset-0 z-50 flex", "p-4 sm:p-8", "items-start")}
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {notifications.map(({ id, show, definition: data }) => (
          <Notification
            key={id}
            id={id}
            show={show}
            definition={data}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        ))}
      </div>
    </div>
  );
}

export default AppNotifications;
