import PageLayout from "~/layouts/page";
import PlayHardLayout from "~/layouts/play-hard";

function Error500Page() {
  return (
    <PageLayout>
      <PlayHardLayout
        text={
          <>
            <span className="text-my-purple">500</span>
            <br />
            <span>Server Side Error</span>
          </>
        }
      />
    </PageLayout>
  );
}

export default Error500Page;
