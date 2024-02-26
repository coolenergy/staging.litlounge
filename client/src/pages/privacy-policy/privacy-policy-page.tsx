import { localStorageHooks } from "~/hooks/local-storage-hooks";
import DocLayout from "~/layouts/doc";
import PageLayout from "~/layouts/page";

function PrivacyPolicyPage() {
  const [isDarkMode] = localStorageHooks.useIsDarkMode();
  return (
    <PageLayout>
      <DocLayout name={isDarkMode ? "privacy-policy.html" : "privacy-policy.light.html"} />
    </PageLayout>
  );
}

export default PrivacyPolicyPage;
