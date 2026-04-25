"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../../components/Icon";

type CreateArticleCopy = {
  dashboard: {
    title: string;
    logout: string;
    articleTitlePlaceholder: string;
    articleSubtitlePlaceholder: string;
    toolbar: {
      bold: string;
      italic: string;
      underline: string;
      subtitle: string;
      list: string;
      link: string;
      image: string;
    };
    editorPlaceholder: string;
    actions: {
      saveDraft: string;
      publish: string;
      preview: string;
    };
    imageUpload: {
      title: string;
      description: string;
    };
    states: {
      dirty: string;
      saving: string;
      saved: string;
      saveError: string;
      publishing: string;
      published: string;
      publishError: string;
      requiredFieldsMissing: string;
      unsavedChangesWarning: string;
    };
    requiredFields: {
      title: string;
      content: string;
      author: string;
      category: string;
    };
    audit: {
      title: string;
      empty: string;
      savedDraft: string;
      startedPublishing: string;
      published: string;
      validationFailed: string;
    };
    meta: {
      title: string;
      authorLabel: string;
      authorPlaceholder: string;
      categoryLabel: string;
      categoryPlaceholder: string;
      tagsLabel: string;
      tagsPlaceholder: string;
    };
  };
};

type DraftData = {
  title: string;
  subtitle: string;
  body: string;
  author: string;
  category: string;
  tags: string;
  featuredImage: string;
  updatedAt: string | null;
};

type AuditEvent = {
  id: string;
  action: string;
  at: string;
};

type ToolbarKey = "bold" | "italic" | "underline" | "subtitle" | "list" | "link";

const AUTOSAVE_INTERVAL_MS = 8000;
const MAX_AUDIT_EVENTS = 20;

export default function CreateArticleAdminClient({
  locale,
  copy,
}: {
  locale: string;
  copy: CreateArticleCopy;
}) {
  const storageKey = useMemo(() => `create-article:draft:${locale}`, [locale]);
  const auditStorageKey = useMemo(() => `create-article:audit:${locale}`, [locale]);

  const [draft, setDraft] = useState<DraftData>({
    title: "",
    subtitle: "",
    body: "",
    author: "",
    category: "",
    tags: "",
    featuredImage: "",
    updatedAt: null,
  });
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>("");
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published" | "error">("idle");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activeToolbar, setActiveToolbar] = useState<Record<ToolbarKey, boolean>>({
    bold: false,
    italic: false,
    underline: false,
    subtitle: false,
    list: false,
    link: false,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturedDragActive, setIsFeaturedDragActive] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const featuredImageInputRef = useRef<HTMLInputElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const suppressNextKeyUpRef = useRef(false);
  const dotModeRef = useRef(false);

  const serializeDraft = (value: DraftData) =>
    JSON.stringify({
      title: value.title.trim(),
      subtitle: value.subtitle.trim(),
      body: value.body.trim(),
      author: value.author.trim(),
      category: value.category.trim(),
      tags: value.tags.trim(),
      featuredImage: value.featuredImage.trim(),
    });

  const appendAudit = (action: string) => {
    setAuditEvents((prev) => {
      const next = [
        { id: `${Date.now()}-${Math.random()}`, action, at: new Date().toISOString() },
        ...prev,
      ].slice(0, MAX_AUDIT_EVENTS);
      localStorage.setItem(auditStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const getPlainText = (html: string) =>
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const runValidation = (value: DraftData) => {
    const missing: string[] = [];
    if (!value.title.trim()) missing.push(copy.dashboard.requiredFields.title);
    if (!getPlainText(value.body)) missing.push(copy.dashboard.requiredFields.content);
    if (!value.author.trim()) missing.push(copy.dashboard.requiredFields.author);
    if (!value.category.trim()) missing.push(copy.dashboard.requiredFields.category);
    return missing;
  };

  const saveDraft = async () => {
    setSaveState("saving");
    try {
      const nextDraft: DraftData = {
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(nextDraft));
      setDraft(nextDraft);
      setLastSavedSnapshot(serializeDraft(nextDraft));
      setSaveState("saved");
      appendAudit(copy.dashboard.audit.savedDraft);
      setValidationMessage(null);
    } catch {
      setSaveState("error");
      setValidationMessage(copy.dashboard.states.saveError);
    }
  };

  const publishArticle = async () => {
    const missing = runValidation(draft);
    if (missing.length > 0) {
      setPublishState("error");
      setValidationMessage(`${copy.dashboard.states.requiredFieldsMissing} ${missing.join(", ")}.`);
      appendAudit(copy.dashboard.audit.validationFailed);
      return;
    }

    setPublishState("publishing");
    appendAudit(copy.dashboard.audit.startedPublishing);
    setValidationMessage(null);

    await saveDraft();
    setPublishState("published");
    appendAudit(copy.dashboard.audit.published);
  };

  const openPreview = () => {
    if (typeof window !== "undefined") {
      window.open(`/${locale}/createarticle/preview`, "_blank", "noopener,noreferrer");
    }
    setIsMobileMenuOpen(false);
    // saveDraft writes to localStorage synchronously before its first await,
    // so the new tab's React hydration will see the latest draft.
    void saveDraft();
  };

  const isDirty = useMemo(() => serializeDraft(draft) !== lastSavedSnapshot, [draft, lastSavedSnapshot]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DraftData;
        const restored: DraftData = {
          title: parsed.title ?? "",
          subtitle: parsed.subtitle ?? "",
          body: parsed.body ?? "",
          author: parsed.author ?? "",
          category: parsed.category ?? "",
          tags: parsed.tags ?? "",
          featuredImage: parsed.featuredImage ?? "",
          updatedAt: parsed.updatedAt ?? null,
        };
        setDraft(restored);
        setLastSavedSnapshot(serializeDraft(restored));
      } else {
        setLastSavedSnapshot(serializeDraft(draft));
      }

      const auditRaw = localStorage.getItem(auditStorageKey);
      if (auditRaw) {
        setAuditEvents(JSON.parse(auditRaw) as AuditEvent[]);
      }
    } catch {
      setValidationMessage(copy.dashboard.states.saveError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditStorageKey, copy.dashboard.states.saveError, storageKey]);

  useEffect(() => {
    if (isDirty) {
      setSaveState("dirty");
      setPublishState("idle");
    }
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = window.setInterval(() => {
      void saveDraft();
    }, AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isDirty, draft]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = copy.dashboard.states.unsavedChangesWarning;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [copy.dashboard.states.unsavedChangesWarning, isDirty]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const handleChange =
    (field: keyof DraftData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft((prev) => ({ ...prev, [field]: event.target.value }));
      setValidationMessage(null);
    };

  const syncBodyFromEditor = () => {
    const html = editorRef.current?.innerHTML ?? "";
    setDraft((prev) => ({ ...prev, body: html }));
    setValidationMessage(null);
  };

  const saveCurrentSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const editor = editorRef.current;
    if (!editor) return;
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return;
    savedRangeRef.current = range.cloneRange();
  };

  const restoreSavedSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;
    if (!selection || !range) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const isSelectionInsideEditor = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection || selection.rangeCount === 0 || !editor) return false;
    const range = selection.getRangeAt(0);
    return editor.contains(range.startContainer) && editor.contains(range.endContainer);
  };

  const runEditorCommand = (command: string, value?: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (!isSelectionInsideEditor()) {
      restoreSavedSelection();
    }
    document.execCommand(command, false, value);
    saveCurrentSelection();
    syncBodyFromEditor();
    updateActiveToolbarState();
  };

  const handleInlineImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) return;
      runEditorCommand(
        "insertHTML",
        `<img src="${src}" alt="" style="display:block;max-width:100%;height:auto;margin:16px auto;border-radius:12px;" />`
      );
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const setFeaturedImageFromFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) return;
      setDraft((prev) => ({ ...prev, featuredImage: src }));
      setValidationMessage(null);
      appendAudit("Featured image updated");
      if (featuredImageInputRef.current) {
        featuredImageInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFeaturedImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsFeaturedDragActive(false);
    setFeaturedImageFromFile(file);
  };

  const openFeaturedImagePicker = () => {
    setIsFeaturedDragActive(false);
    featuredImageInputRef.current?.click();
  };

  const handleFeaturedImageDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsFeaturedDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    setFeaturedImageFromFile(file);
  };

  const openInlineImagePicker = () => {
    inlineImageInputRef.current?.click();
    setIsMobileMenuOpen(false);
  };

  const isSelectionInsideSubtitle = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection || selection.rangeCount === 0 || !editor) return false;
    let node: Node | null = selection.getRangeAt(0).startContainer;
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "H2") {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  const isSelectionInsideLink = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection || selection.rangeCount === 0 || !editor) return false;
    let node: Node | null = selection.getRangeAt(0).startContainer;
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === "A") {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  const updateActiveToolbarState = () => {
    setActiveToolbar({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      subtitle: isSelectionInsideSubtitle(),
      list: dotModeRef.current,
      link: isSelectionInsideLink(),
    });
  };

  const toggleDotMode = () => {
    dotModeRef.current = !dotModeRef.current;
    setActiveToolbar((prev) => ({ ...prev, list: dotModeRef.current }));
  };

  const toggleSubtitle = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (!isSelectionInsideEditor()) {
      restoreSavedSelection();
    }
    const isSubtitle = isSelectionInsideSubtitle();
    document.execCommand("formatBlock", false, isSubtitle ? "p" : "h2");
    saveCurrentSelection();
    syncBodyFromEditor();
    updateActiveToolbarState();
  };

  const toggleLink = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (!isSelectionInsideEditor()) {
      restoreSavedSelection();
    }

    if (isSelectionInsideLink()) {
      document.execCommand("unlink");
      saveCurrentSelection();
      syncBodyFromEditor();
      updateActiveToolbarState();
      return;
    }

    const raw = window.prompt("Enter link URL (https://...)");
    if (!raw) return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    document.execCommand("createLink", false, normalized);
    saveCurrentSelection();
    syncBodyFromEditor();
    updateActiveToolbarState();
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== draft.body) {
      el.innerHTML = draft.body || "";
    }
  }, [draft.body]);

  const resetToolbarState = () => {
    setActiveToolbar({
      bold: false,
      italic: false,
      underline: false,
      subtitle: false,
      list: false,
      link: false,
    });
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    const shouldDisable = { ...activeToolbar };
    suppressNextKeyUpRef.current = true;

    event.preventDefault();
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (!isSelectionInsideEditor()) {
      restoreSavedSelection();
    }

    if (dotModeRef.current) {
      document.execCommand("insertHTML", false, "<br>●&nbsp;");
      syncBodyFromEditor();
      saveCurrentSelection();
      window.setTimeout(updateActiveToolbarState, 0);
      suppressNextKeyUpRef.current = false;
      return;
    }

    // Disable inline typing styles BEFORE creating the new line so they aren't
    // inherited by the next paragraph caret (especially underline).
    if (shouldDisable.bold) {
      document.execCommand("bold");
    }
    if (shouldDisable.italic) {
      document.execCommand("italic");
    }
    if (shouldDisable.underline) {
      document.execCommand("underline");
    }

    document.execCommand("insertParagraph");

    requestAnimationFrame(() => {
      if (shouldDisable.underline) {
        if (document.queryCommandState("underline")) {
          document.execCommand("underline");
        }
      }
      document.execCommand("formatBlock", false, "p");
      document.execCommand("unlink");
      syncBodyFromEditor();
      resetToolbarState();
      saveCurrentSelection();
      window.setTimeout(updateActiveToolbarState, 0);
      suppressNextKeyUpRef.current = false;
    });
  };

  const handleEditorKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (suppressNextKeyUpRef.current && event.key === "Enter") {
      return;
    }
    if (event.key === "Shift" || event.key === "Control" || event.key === "Alt" || event.key === "Meta") {
      return;
    }
    updateActiveToolbarState();
  };

  const handleToolbarMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    saveCurrentSelection();
  };

  const saveStatusLabel =
    saveState === "dirty"
      ? copy.dashboard.states.dirty
      : saveState === "saving"
        ? copy.dashboard.states.saving
        : saveState === "saved"
          ? copy.dashboard.states.saved
          : saveState === "error"
            ? copy.dashboard.states.saveError
            : null;

  const publishStatusLabel =
    publishState === "publishing"
      ? copy.dashboard.states.publishing
      : publishState === "published"
        ? copy.dashboard.states.published
        : publishState === "error"
          ? copy.dashboard.states.publishError
          : null;

  const updatedAtLabel = draft.updatedAt
    ? `${copy.dashboard.states.saved}: ${new Date(draft.updatedAt).toLocaleString()}`
    : null;

  const statusDotClass =
    saveState === "saved"
      ? "bg-emerald-500"
      : saveState === "saving"
        ? "bg-amber-500 animate-pulse"
        : saveState === "dirty"
          ? "bg-amber-500"
          : saveState === "error"
            ? "bg-error"
            : "bg-on-surface/30";

  const sidebarItemClass = (isActive: boolean) =>
    `group flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
      isActive
        ? "border-primary bg-primary/15 text-primary"
        : "border-transparent text-on-surface hover:border-outline/30 hover:bg-surface-container"
    }`;

  const formatToolsBlock = (
    <div className="px-2 py-3">
      <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface/50">
        Format
      </div>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            aria-pressed={activeToolbar.bold}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => runEditorCommand("bold")}
            className={sidebarItemClass(activeToolbar.bold)}
          >
            <Icon name="format_bold" className="text-lg" />
            <span className="font-medium">{copy.dashboard.toolbar.bold}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-pressed={activeToolbar.italic}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => runEditorCommand("italic")}
            className={sidebarItemClass(activeToolbar.italic)}
          >
            <Icon name="format_italic" className="text-lg" />
            <span className="font-medium">{copy.dashboard.toolbar.italic}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-pressed={activeToolbar.underline}
            onMouseDown={handleToolbarMouseDown}
            onClick={() => runEditorCommand("underline")}
            className={sidebarItemClass(activeToolbar.underline)}
          >
            <Icon name="format_underlined" className="text-lg" />
            <span className="font-medium">{copy.dashboard.toolbar.underline}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-pressed={activeToolbar.subtitle}
            onMouseDown={handleToolbarMouseDown}
            onClick={toggleSubtitle}
            className={sidebarItemClass(activeToolbar.subtitle)}
          >
            <Icon name="title" className="text-lg" />
            <span className="font-medium">{copy.dashboard.toolbar.subtitle}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-pressed={activeToolbar.list}
            onMouseDown={handleToolbarMouseDown}
            onClick={toggleDotMode}
            className={sidebarItemClass(activeToolbar.list)}
          >
            <Icon name="format_list_bulleted" className="text-lg" />
            <span className="font-medium">{copy.dashboard.toolbar.list}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            aria-pressed={activeToolbar.link}
            onMouseDown={handleToolbarMouseDown}
            onClick={toggleLink}
            className={sidebarItemClass(activeToolbar.link)}
          >
            <Icon name="link" className="text-lg" />
            <span className="font-medium">{copy.dashboard.toolbar.link}</span>
          </button>
        </li>
      </ul>

      <div className="mt-5 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface/50">
        Insert
      </div>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onMouseDown={handleToolbarMouseDown}
            onClick={openInlineImagePicker}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-primary bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90"
          >
            <Icon name="add_photo_alternate" className="text-lg" />
            <span>{copy.dashboard.toolbar.image}</span>
          </button>
        </li>
      </ul>
    </div>
  );

  const settingsPanelBlock = (
    <div className="space-y-5 p-4">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface/60">
          {copy.dashboard.imageUpload.title}
        </p>
        <button
          type="button"
          onClick={openFeaturedImagePicker}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsFeaturedDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsFeaturedDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsFeaturedDragActive(false);
          }}
          onDrop={handleFeaturedImageDrop}
          className={`relative flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed px-4 text-center text-sm transition-colors ${
            isFeaturedDragActive
              ? "border-primary bg-primary/10 text-on-surface"
              : "border-outline/50 bg-surface-container-lowest text-on-surface/70 hover:border-primary hover:text-on-surface"
          }`}
        >
          {draft.featuredImage ? (
            <>
              <img
                src={draft.featuredImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45" />
              <span className="relative z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                {copy.dashboard.imageUpload.description}
              </span>
            </>
          ) : (
            <>
              <Icon name="cloud_upload" className="text-2xl text-on-surface/50" />
              {copy.dashboard.imageUpload.description}
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface/60">
            {copy.dashboard.meta.authorLabel}
          </span>
          <input
            type="text"
            value={draft.author}
            onChange={handleChange("author")}
            placeholder={copy.dashboard.meta.authorPlaceholder}
            className="w-full rounded-lg border border-outline/40 bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface/60">
            {copy.dashboard.meta.categoryLabel}
          </span>
          <input
            type="text"
            value={draft.category}
            onChange={handleChange("category")}
            placeholder={copy.dashboard.meta.categoryPlaceholder}
            className="w-full rounded-lg border border-outline/40 bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface/60">
            {copy.dashboard.meta.tagsLabel}
          </span>
          <input
            type="text"
            value={draft.tags}
            onChange={handleChange("tags")}
            placeholder={copy.dashboard.meta.tagsPlaceholder}
            className="w-full rounded-lg border border-outline/40 bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface/60">
          {copy.dashboard.audit.title}
        </p>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-outline/30 bg-surface-container-lowest p-2">
          {auditEvents.length === 0 ? (
            <p className="px-2 py-3 text-sm text-on-surface/60">
              {copy.dashboard.audit.empty}
            </p>
          ) : (
            <ul className="space-y-1">
              {auditEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-lg border border-outline/20 bg-surface-container-low p-2"
                >
                  <p className="text-sm">{event.action}</p>
                  <p className="text-[11px] text-on-surface/60">
                    {new Date(event.at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {validationMessage ? (
        <p
          className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-xs text-error"
          role="alert"
        >
          {validationMessage}
        </p>
      ) : null}
    </div>
  );

  const saveDraftButton = (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={openPreview}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline/40 bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
      >
        <Icon name="visibility" className="text-base" />
        {copy.dashboard.actions.preview}
      </button>
      <button
        type="button"
        onClick={() => void saveDraft()}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={saveState === "saving"}
      >
        <Icon name="save" className="text-base" />
        {copy.dashboard.actions.saveDraft}
      </button>
    </div>
  );

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-surface text-on-surface">
      {/* Hidden inline image picker, shared by all Add Image buttons */}
      <input
        ref={inlineImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleInlineImageUpload}
        className="hidden"
      />
      <input
        ref={featuredImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFeaturedImageChange}
        className="hidden"
      />

      {/* TOP BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-outline/30 bg-surface-container-highest px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="admin-mobile-drawer"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-outline/40 bg-surface-container-low text-on-surface hover:bg-surface-container md:hidden"
          >
            <Icon name="menu" className="text-xl" />
          </button>

          <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary md:flex">
            <Icon name="edit_note" className="text-xl" />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-headline text-sm font-bold md:text-base">
              {copy.dashboard.title}
            </h1>
            {updatedAtLabel ? (
              <p className="hidden truncate text-[11px] text-on-surface/60 md:block">
                {updatedAtLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {saveStatusLabel ? (
            <span className="hidden items-center gap-2 rounded-full border border-outline/40 bg-surface-container-low px-3 py-1 text-xs text-on-surface/80 md:inline-flex">
              <span className={`h-2 w-2 rounded-full ${statusDotClass}`} />
              {saveStatusLabel}
            </span>
          ) : null}
          {saveStatusLabel ? (
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full md:hidden ${statusDotClass}`}
              title={saveStatusLabel}
              aria-label={saveStatusLabel}
            />
          ) : null}
          {publishStatusLabel ? (
            <span className="hidden rounded-full border border-outline/40 bg-surface-container-low px-3 py-1 text-xs text-on-surface/80 md:inline-block">
              {publishStatusLabel}
            </span>
          ) : null}

          <form action={`/${locale}/createarticle/logout`} method="post">
            <button
              type="submit"
              aria-label={copy.dashboard.logout}
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border border-outline/40 bg-surface-container-low px-2 text-sm font-medium text-on-surface hover:bg-surface-container md:px-3"
            >
              <Icon name="logout" className="text-base" />
              <span className="hidden md:inline">{copy.dashboard.logout}</span>
            </button>
          </form>

          <button
            type="button"
            onClick={openPreview}
            aria-label={copy.dashboard.actions.preview}
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border border-outline/40 bg-surface-container-low px-2 text-sm font-medium text-on-surface hover:bg-surface-container md:px-3"
          >
            <Icon name="visibility" className="text-base" />
            <span className="hidden md:inline">{copy.dashboard.actions.preview}</span>
          </button>

          <button
            type="button"
            onClick={() => void publishArticle()}
            disabled={publishState === "publishing"}
            aria-label={copy.dashboard.actions.publish}
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 md:px-4"
          >
            <Icon name="send" className="text-base" />
            <span className="hidden md:inline">{copy.dashboard.actions.publish}</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR (desktop) */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-outline/30 bg-surface-container-low md:flex">
          <div className="flex-1 overflow-y-auto">{formatToolsBlock}</div>
        </aside>

        {/* CENTER CANVAS */}
        <section className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-3 py-4 md:px-8 md:py-10">
            <div className="rounded-2xl border border-outline/30 bg-surface-container-lowest shadow-sm">
              <input
                type="text"
                value={draft.title}
                onChange={handleChange("title")}
                placeholder={copy.dashboard.articleTitlePlaceholder}
                className="w-full rounded-t-2xl border-0 border-b border-outline/20 bg-transparent px-5 py-5 font-headline text-2xl font-bold tracking-tight outline-none focus:border-primary md:px-8 md:py-7 md:text-[30px]"
              />
              <input
                type="text"
                value={draft.subtitle}
                onChange={handleChange("subtitle")}
                placeholder={copy.dashboard.articleSubtitlePlaceholder}
                className="w-full border-0 border-b border-outline/20 bg-transparent px-5 py-4 text-base text-on-surface/80 outline-none focus:border-primary md:px-8 md:text-lg"
              />

              <div className="relative">
                {!getPlainText(draft.body) ? (
                  <p className="pointer-events-none absolute left-5 top-4 text-base text-on-surface/50 md:left-8 md:top-6">
                    {copy.dashboard.editorPlaceholder}
                  </p>
                ) : null}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncBodyFromEditor}
                  onMouseUp={updateActiveToolbarState}
                  onKeyUp={handleEditorKeyUp}
                  onKeyDown={handleEditorKeyDown}
                  onFocus={updateActiveToolbarState}
                  onBlur={saveCurrentSelection}
                  className="min-h-[60vh] w-full rounded-b-2xl border-0 bg-transparent px-5 py-4 text-base outline-none md:min-h-[700px] md:px-8 md:py-6 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-headline [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-on-surface"
                />
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR (desktop) */}
        <aside className="hidden w-80 shrink-0 flex-col border-l border-outline/30 bg-surface-container-low lg:flex">
          <div className="flex h-12 shrink-0 items-center border-b border-outline/30 px-4">
            <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface/80">
              {copy.dashboard.meta.title}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">{settingsPanelBlock}</div>

          <div className="shrink-0 border-t border-outline/30 bg-surface-container-low p-3">
            {saveDraftButton}
          </div>
        </aside>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${isMobileMenuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <aside
          id="admin-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={copy.dashboard.title}
          className={`absolute inset-y-0 left-0 flex w-[85vw] max-w-sm flex-col border-r border-outline/30 bg-surface-container-low text-on-surface shadow-xl transition-transform duration-200 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-outline/30 bg-surface-container-highest px-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon name="edit_note" className="text-xl" />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate font-headline text-sm font-bold">
                  {copy.dashboard.title}
                </p>
                {saveStatusLabel ? (
                  <p className="flex items-center gap-1.5 truncate text-[11px] text-on-surface/70">
                    <span className={`h-2 w-2 rounded-full ${statusDotClass}`} />
                    {saveStatusLabel}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-outline/40 bg-surface-container-low text-on-surface hover:bg-surface-container"
            >
              <Icon name="close" className="text-xl" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {formatToolsBlock}

            <div className="border-t border-outline/30">
              <div className="px-4 pt-4 text-[11px] font-semibold uppercase tracking-wider text-on-surface/50">
                {copy.dashboard.meta.title}
              </div>
              {settingsPanelBlock}
            </div>
          </div>

          <div className="shrink-0 border-t border-outline/30 bg-surface-container-low p-3">
            {saveDraftButton}
          </div>
        </aside>
      </div>
    </main>
  );
}
