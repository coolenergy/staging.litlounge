import { clsx } from "clsx";
import { useState } from "react";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import DialogLayout from "~/layouts/dialog";
import { Model } from "~/utils/api";
import { consts } from "~/utils/consts";
import ellipsize from "~/utils/ellipsize";
import PageContext from "./page-context";

const { nothing, waiting } = consts.text;

function getText(model: Model | undefined) {
  return model ? model.aboutMe?.trim() ?? nothing : waiting;
}

function getTags(model: Model | undefined) {
  return model ? model.tags?.map((v) => `#${v.trim()}`).join(" ") || nothing : waiting;
}

function Dialog({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const page = useContextOrThrow(PageContext);
  const text = getText(page.model);
  const tags = getTags(page.model);
  return (
    <DialogLayout open={open} setOpen={setOpen}>
      <span className="whitespace-pre-wrap">{text}</span>
      <br />
      <span>{tags}</span>
    </DialogLayout>
  );
}

function AboutAndTags() {
  const page = useContextOrThrow(PageContext);
  const text = getText(page.model);
  const ellipsizedText = ellipsize(text, 80);
  const tags = getTags(page.model);
  const ellipsizedTags = ellipsize(tags, 60);
  const [isDialogOpen, setDialogOpen] = useState(false);
  return (
    <div className="flex grow">
      <div className="flex flex-col items-start justify-center">
        <div
          className={clsx(
            "overflow-hidden break-words",
            page.model?.isOnline ? "h-[1.375rem] text-15" : "h-[2.25rem] text-12",
            "xl:h-[2.0625rem] xl:text-22"
          )}
        >
          <div className="xl:hidden">{text}</div>
          <div className="hidden xl:block">{ellipsizedText}</div>
        </div>
        <div
          className={clsx(
            page.model?.isOnline && "hidden xl:block",
            "overflow-hidden",
            "h-[1.25rem] text-13",
            "xl:h-[2.0625rem] xl:text-22",
            "font-medium text-my-purple"
          )}
        >
          <div className="xl:hidden">{tags}</div>
          <div className="hidden xl:block">{ellipsizedTags}</div>
        </div>
      </div>
      {(text != nothing || tags != nothing) && (
        <button
          className={clsx(
            "focus-visible:use-outline",
            "flex items-center justify-center",
            "ml-2 rounded-10",
            page.model?.isOnline ? "text-15" : "text-12",
            "text-my-purple"
          )}
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Show
        </button>
      )}
      <Dialog open={isDialogOpen} setOpen={setDialogOpen} />
    </div>
  );
}

export default AboutAndTags;
