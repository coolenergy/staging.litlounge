import { clsx } from "clsx";
import PlayHardLayout from "~/layouts/play-hard";

function DocLayout({ name }: { name: string }) {
  return (
    <PlayHardLayout hide={{ logo: "onMobiles", text: "onMobiles" }}>
      <div
        className={clsx(
          "flex grow items-end justify-center",
          "p-4 xl:p-0 xl:px-6 xl:pb-14 3xl:pr-10"
        )}
      >
        <div
          className={clsx(
            "relative h-full w-full rounded-24 border-2 border-my-purple p-3 xl:rounded-8",
            "bg-my-light/75 dark:bg-my-dark/75 xl:bg-white/75"
          )}
        >
          <iframe className="h-full w-full" src={`docs/${name}`} />
        </div>
      </div>
    </PlayHardLayout>
  );
}

export default DocLayout;
