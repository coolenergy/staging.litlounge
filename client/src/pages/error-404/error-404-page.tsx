import PageLayout from "~/layouts/page";
import PlayHardLayout from "~/layouts/play-hard";

function Error404Page() {
  return (
    <PageLayout>
      <PlayHardLayout
        text={
          <>
            <span className="text-my-purple">404</span>
            <br />
            <span>PageLayout Not Found</span>
          </>
        }
      />
    </PageLayout>
  );
}

export default Error404Page;
