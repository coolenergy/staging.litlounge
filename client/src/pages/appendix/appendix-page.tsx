import { localStorageHooks } from "~/hooks/local-storage-hooks";
import DocLayout from "~/layouts/doc";
import PageLayout from "~/layouts/page";

function AppendixPage() {
  const [isDarkMode] = localStorageHooks.useIsDarkMode();
  return (
    <PageLayout>
      <DocLayout name={isDarkMode ? "appendix-c.html" : "appendix-c.light.html"} />
    </PageLayout>
  );
}

export default AppendixPage;
