// types/developer.ts
export type SdkLanguage = 'python' | 'typescript' | 'java' | 'csharp' | 'go' | 'cli';

export interface LangMeta {
    label: string;
    reg: string;
    pkg: string;
    requires: string;
    title: string;
    cmd: string;
    out: string;
}

export interface WebhookEvent {
    name: string;
    desc: string;
    schema: string;
}

export interface ChangelogItem {
    date: string;
    version: string;
    tags: ('feature' | 'fix' | 'breaking' | 'deprecation')[];
    changes: string[];
}