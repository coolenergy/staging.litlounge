import PageLayout from "~/layouts/page";
import Models from "./models";
import Streams from "./streams";

function HomePage() {
  return (
    <PageLayout bg={["bg-mobile-home.jpg"]}>
      <div className="flex grow flex-col p-4">
        <Streams />
        <Models />
      </div>
    </PageLayout>
  );
}

export default HomePage;
