import { createContext } from "react";
import { NotificationDefinition } from "~/components/app-notifications";
import { AppAuthDialogOpenState } from "../app-auth-dilalog/app-auth-dialog";

type AppContext = {
  readonly pushNotification: (data: NotificationDefinition) => void;
  readonly isLoginDialogOpen: AppAuthDialogOpenState;
  readonly setLoginDialogOpen: (value: AppAuthDialogOpenState) => void;
  readonly isUserMenuDialogOpen: boolean;
  readonly setUserMenuDialogOpen: (value: boolean) => void;
  readonly searchQuery: string;
  readonly setSearchQuery: (value: string) => void;
  readonly openBuyTokensDialog: () => void;
};

const AppContext = createContext<AppContext | undefined>(undefined);
AppContext.displayName = "AppContext";

export default AppContext;
