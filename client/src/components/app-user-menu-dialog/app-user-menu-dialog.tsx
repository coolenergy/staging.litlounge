import clsx from "clsx";
import { localStorageHooks } from "~/hooks/local-storage-hooks";
import DialogLayout from "~/layouts/dialog";

function AppUserMenuDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [_, setJwt] = localStorageHooks.useJwt();
  return (
    <DialogLayout open={open} setOpen={setOpen} position="asHeaderPopup">
      <button
        className={clsx(
          "focus-visible:use-outline",
          "rounded-10 border border-my-purple px-4 py-1"
        )}
        onClick={() => {
          setJwt("");
          setOpen(false);
        }}
      >
        Log out
      </button>
    </DialogLayout>
  );
}

export default AppUserMenuDialog;
