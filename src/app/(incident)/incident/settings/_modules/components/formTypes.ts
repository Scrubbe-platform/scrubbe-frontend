export interface FormProps {
  draft: any;
  setDraft: (fn: (d: any) => any) => void;
  state: Record<string, any>;
  ledger: { catName: string; summary: string; ts: number; actor: string }[];
}
export function patch(setDraft: FormProps["setDraft"], partial: Record<string, any>) {
  setDraft((d) => ({ ...d, ...partial }));
}
export function setPath(setDraft: FormProps["setDraft"], path: string, val: any) {
  setDraft((d) => {
    const parts = path.split(".");
    const next = { ...d };
    let o: any = next;
    for (let i = 0; i < parts.length - 1; i++) {
      o[parts[i]] = { ...o[parts[i]] };
      o = o[parts[i]];
    }
    o[parts[parts.length - 1]] = val;
    return next;
  });
}
