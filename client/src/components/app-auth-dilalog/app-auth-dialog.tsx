import { Dialog } from "@headlessui/react";
import { ErrorMessage } from "@hookform/error-message";
import { clsx } from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiMutationHooks } from "~/hooks/api-mutation-hooks";
import DialogLayout from "~/layouts/dialog";
import { chooseBy } from "~/utils/choose-by";

const className = {
  input: clsx(
    "focus-visible:use-outline",
    "block appearance-none bg-[#eeeeee]",
    "w-full px-6 py-2.5 xl:py-1",
    "rounded-full xl:rounded-10",
    "font-light text-black placeholder:text-[#999999]"
  ),
  fieldError: "text-sm text-red-500 dark:text-red-100 mt-1 text-right",
  button: clsx(
    "hover:use-shadow focus-visible:use-outline",
    "flex-1 xl:-skew-x-12",
    "w-full xl:w-auto",
    "py-2 xl:py-1.5 xl:px-8",
    "xl:rounded-2 rounded-full"
  ),
};

export type AppAuthDialogOpenState = boolean | "asHeaderPopup";

function AppAuthDialog({
  open,
  setOpen,
  type,
  onSwitchType,
}: {
  open: AppAuthDialogOpenState;
  setOpen: (value: AppAuthDialogOpenState) => void;
  type: "signup" | "login";
  onSwitchType: (openState: AppAuthDialogOpenState) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{
    login: string;
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }>({
    defaultValues: {
      login: "",
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);
  const signUp = apiMutationHooks.useSignUp({
    onSuccess: closeDialog,
  });
  const logIn = apiMutationHooks.useLogIn({
    onSuccess: closeDialog,
  });
  const [openState, setOpenState] = useState<AppAuthDialogOpenState>(open);
  useEffect(() => {
    if (open) {
      setOpenState(open);
    }
  }, [open]);
  return (
    <DialogLayout
      open={open !== false}
      setOpen={setOpen}
      position={typeof openState === "string" ? openState : "center"}
      width="sm"
      opacity="75"
    >
      <Dialog.Title
        as="h3"
        className={clsx(
          "mb-5 px-1 font-semibold",
          "text-lg xl:text-xl",
          "text-left xl:text-center"
        )}
      >
        {chooseBy(type, {
          signup: "Register",
          login: "Login",
        })}
      </Dialog.Title>
      <form
        className={clsx(type === "login" && "mb-1")}
        onSubmit={handleSubmit(async (formData) => {
          switch (type) {
            case "signup":
              await signUp(formData);
              break;
            case "login":
              await logIn(formData);
              break;
          }
        })}
      >
        <div className="space-y-3">
          {type === "signup" ? (
            <>
              <div>
                <input
                  {...register("username", { required: true })}
                  type="text"
                  placeholder="Username"
                  className={className.input}
                />
                <ErrorMessage
                  errors={errors}
                  name="username"
                  message="Username is required"
                  as="p"
                  className={className.fieldError}
                />
              </div>
              <div>
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="Email"
                  className={className.input}
                />
                <ErrorMessage
                  errors={errors}
                  name="email"
                  message="Email is required"
                  as="p"
                  className={className.fieldError}
                />
              </div>
            </>
          ) : (
            <div>
              <input
                {...register("login", { required: true })}
                type="text"
                placeholder="Username or email"
                className={className.input}
              />
              <ErrorMessage
                errors={errors}
                name="login"
                message="Username or email is required"
                as="p"
                className={className.fieldError}
              />
            </div>
          )}
          <div>
            <input
              {...register("password", { required: true, minLength: 6 })}
              type="password"
              placeholder="Password"
              className={className.input}
            />
            <ErrorMessage
              errors={errors}
              name="password"
              message="Password must be 6 characters or more"
              as="p"
              className={className.fieldError}
            />
          </div>
          {type === "signup" && (
            <div>
              <input
                {...register("passwordConfirmation", {
                  required: true,
                  minLength: 6,
                  validate: (value) => {
                    if (watch("password") != value) {
                      return "Your passwords do not match";
                    }
                  },
                })}
                type="password"
                placeholder="Password confirmation"
                className={className.input}
              />
              <ErrorMessage
                errors={errors}
                name="passwordConfirmation"
                message="Your passwords do not match"
                as="p"
                className={className.fieldError}
              />
            </div>
          )}
        </div>
        <div className={clsx("mt-5 flex justify-center gap-4 xl:px-3", "flex-col xl:flex-row")}>
          {type === "login" && (
            <button
              type="submit"
              className={clsx(className.button, "border border-my-purple bg-transparent")}
            >
              <span className="inline-block text-my-purple dark:text-white xl:skew-x-12">
                Login
              </span>
            </button>
          )}
          <button
            type={chooseBy(type, {
              signup: "submit",
              login: "button",
            })}
            className={clsx(className.button, "bg-my-purple")}
            onClick={type === "login" ? () => onSwitchType(openState) : undefined}
          >
            <span className="inline-block text-white xl:skew-x-12">Register</span>
          </button>
        </div>
      </form>
      {type === "signup" && (
        <>
          <hr className="mt-6 hidden xl:block" />
          <div className="mt-5 text-center xl:text-sm">
            Already have an account?{" "}
            <button
              className="mx-auto font-medium text-my-purple xl:mt-2 xl:block xl:hover:underline"
              onClick={() => onSwitchType(openState)}
            >
              Login
            </button>
          </div>
        </>
      )}
    </DialogLayout>
  );
}

export default AppAuthDialog;
