import { localStorageHooks } from "~/hooks/local-storage-hooks";
import DocLayout from "~/layouts/doc";
import PageLayout from "~/layouts/page";

function AboutPage() {
  const [isDarkMode] = localStorageHooks.useIsDarkMode();
  return (
    <PageLayout>
      <DocLayout name={isDarkMode ? "about.html" : "about.light.html"} />
    </PageLayout>
  );
}

export default AboutPage;
