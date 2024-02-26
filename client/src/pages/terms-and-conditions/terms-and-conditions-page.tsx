import { localStorageHooks } from "~/hooks/local-storage-hooks";
import DocLayout from "~/layouts/doc";
import PageLayout from "~/layouts/page";

function TermsAndConditionsPage() {
  const [isDarkMode] = localStorageHooks.useIsDarkMode();
  return (
    <PageLayout>
      <DocLayout
        name={isDarkMode ? "terms-and-conditions.html" : "terms-and-conditions.light.html"}
      />
    </PageLayout>
  );
}

export default TermsAndConditionsPage;
