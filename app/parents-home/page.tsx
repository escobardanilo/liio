"use client";

import Link from "next/link";
import { liioCopy } from "@/lib/i18n/catalog";
import { useRouter } from "next/navigation";
import {
  Activity,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { isParentSessionActive } from "@/lib/parent-session";
import {
  deleteChild,
  ensureFamilyIdentity,
  listChildren,
  upsertChild,
} from "@/lib/services/family-service";
import {
  getParentProfile,
  getSelectedChildId,
  setSelectedChildId,
} from "@/lib/services/local-state";
import { useLiioLanguage } from "../components/use-liio-language";
import { MobileShell } from "../components/ui";
import { ParentsDrawer } from "../components/parents-drawer";
import styles from "./page.module.css";

type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

type ProfileForm = {
  name: string;
  age: string;
};


const copy = liioCopy.parentsHome;


export default function ParentsHomePage() {
  const router = useRouter();
  const { language } = useLiioLanguage();
  const t = copy[language];

  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    age: "",
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadParentsArea() {
      try {
        const parentProfile = getParentProfile();

        if (!parentProfile || !isParentSessionActive()) {
          router.replace("/responsible-area");
          return;
        }

        await ensureFamilyIdentity(parentProfile, language);

        const loadedProfiles = await listChildren();

        if (cancelled) {
          return;
        }

        setProfiles(loadedProfiles);

        const storedSelectedId =
          getSelectedChildId();

        const selectedStillExists = loadedProfiles.some(
          (profile) => profile.id === storedSelectedId,
        );

        const initialSelectedId = selectedStillExists
          ? storedSelectedId
          : (loadedProfiles[0]?.id ?? null);

        setSelectedId(initialSelectedId);

        if (initialSelectedId) {
          setSelectedChildId(
            initialSelectedId,
          );
        } else {
          setSelectedChildId(null);
        }

        setReady(true);
      } catch {
        if (!cancelled) {
          router.replace("/responsible-area");
        }
      }
    }

    void loadParentsArea();

    return () => {
      cancelled = true;
    };
  }, [language, router]);

  const selectedProfile = useMemo(
    () =>
      profiles.find(
        (profile) => profile.id === selectedId,
      ) ?? null,
    [profiles, selectedId],
  );

  function selectProfile(id: string) {
    setSelectedId(id);
    setSelectedChildId(id);
  }

  function openCreateProfile() {
    setEditingId(null);
    setForm({
      name: "",
      age: "",
    });
    setModalOpen(true);
  }

  function openEditProfile(profile: ChildProfile) {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      age: String(profile.age),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm({
      name: "",
      age: "",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = form.name.trim();
    const age = Number(form.age);

    if (
      !name ||
      !Number.isInteger(age) ||
      age < 6 ||
      age > 15
    ) {
      return;
    }

    const saved = await upsertChild({
      id: editingId,
      name,
      age,
    });

    setProfiles((current) => {
      const exists = current.some(
        (profile) => profile.id === saved.id,
      );

      return exists
        ? current.map((profile) =>
            profile.id === saved.id
              ? saved
              : profile,
          )
        : [...current, saved];
    });

    selectProfile(saved.id);

    closeModal();
  }

  async function removeProfile(profile: ChildProfile) {
    const confirmed = window.confirm(
      t.removeConfirm(profile.name),
    );

    if (!confirmed) {
      return;
    }

    await deleteChild(profile.id);

    setProfiles((current) => {
      const nextProfiles = current.filter(
        (currentProfile) =>
          currentProfile.id !== profile.id,
      );

      if (selectedId === profile.id) {
        const nextSelectedId =
          nextProfiles[0]?.id ?? null;

        setSelectedId(nextSelectedId);

        if (nextSelectedId) {
          setSelectedChildId(
            nextSelectedId,
          );
        } else {
          setSelectedChildId(null);
        }
      }

      return nextProfiles;
    });
  }

  if (!ready) {
    return (
      <MobileShell>
        <section className={styles.page} />
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <section className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              {t.family}
            </p>
            <h1>{t.parents}</h1>
          </div>

          <ParentsDrawer />
        </header>

        {profiles.length === 0 ? (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <UserRound
                size={36}
                strokeWidth={1.8}
              />
            </div>

            <h2>{t.noProfiles}</h2>

            <p>{t.addFirst}</p>

            <button
              className={styles.primaryButton}
              type="button"
              onClick={openCreateProfile}
            >
              <Plus size={20} strokeWidth={2.4} />
              {t.addChild}
            </button>
          </section>
        ) : (
          <>
            <section className={styles.profilesSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionLabel}>
                    {t.children}
                  </p>

                  <span
                    className={styles.sectionDescription}
                  >
                    {t.choose}
                  </span>
                </div>

                <button
                  className={styles.textButton}
                  type="button"
                  onClick={openCreateProfile}
                >
                  {t.add}
                </button>
              </div>

              <div className={styles.profileList}>
                {profiles.map((profile) => {
                  const active =
                    profile.id === selectedId;

                  return (
                    <button
                      key={profile.id}
                      type="button"
                      className={`${styles.profileCard} ${
                        active
                          ? styles.profileCardActive
                          : ""
                      }`}
                      onClick={() =>
                        selectProfile(profile.id)
                      }
                    >
                      <span className={styles.avatar}>
                        {profile.name
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <span
                        className={styles.profileCopy}
                      >
                        <strong>
                          {profile.name}
                        </strong>

                        <small>
                          {profile.age} {t.years}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedProfile ? (
              <>
                <section
                  className={styles.profileDetails}
                >
                  <div
                    className={
                      styles.profileDetailsTop
                    }
                  >
                    <div>
                      <p
                        className={styles.sectionLabel}
                      >
                        {t.profile}
                      </p>

                      <h2>
                        {selectedProfile.name}
                      </h2>

                      <span>
                        {selectedProfile.age}{" "}
                        {t.years}
                      </span>
                    </div>

                    <div
                      className={
                        styles.profileAvatarLarge
                      }
                    >
                      {selectedProfile.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  </div>

                  <div
                    className={styles.profileActions}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openEditProfile(
                          selectedProfile,
                        )
                      }
                    >
                      <Pencil
                        size={19}
                        strokeWidth={2.2}
                      />
                      {t.edit}
                    </button>

                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() =>
                        removeProfile(
                          selectedProfile,
                        )
                      }
                    >
                      <Trash2
                        size={19}
                        strokeWidth={2.2}
                      />
                      {t.remove}
                    </button>
                  </div>
                </section>

                <section
                  className={styles.manageSection}
                >
                  <p className={styles.sectionLabel}>
                    {t.manage}
                  </p>

                  <nav className={styles.manageList}>
                    <Link
                      className={styles.manageRow}
                      href="/activity"
                    >
                      <span
                        className={styles.manageIcon}
                      >
                        <Activity
                          size={20}
                          strokeWidth={2.1}
                        />
                      </span>

                      <span
                        className={styles.manageCopy}
                      >
                        <strong>
                          {t.activity}
                        </strong>
                        <small>
                          {t.activitySub}
                        </small>
                      </span>

                      <ChevronRight
                        size={22}
                        strokeWidth={2.1}
                      />
                    </Link>

                    <Link
                      className={styles.manageRow}
                      href="/time-limits"
                    >
                      <span
                        className={styles.manageIcon}
                      >
                        <Clock3
                          size={20}
                          strokeWidth={2.1}
                        />
                      </span>

                      <span
                        className={styles.manageCopy}
                      >
                        <strong>
                          {t.limits}
                        </strong>
                        <small>
                          {t.limitsSub}
                        </small>
                      </span>

                      <ChevronRight
                        size={22}
                        strokeWidth={2.1}
                      />
                    </Link>

                    <Link
                      className={styles.manageRow}
                      href="/device-codes"
                    >
                      <span
                        className={styles.manageIcon}
                      >
                        <Smartphone
                          size={20}
                          strokeWidth={2.1}
                        />
                      </span>

                      <span
                        className={styles.manageCopy}
                      >
                        <strong>
                          {t.devices}
                        </strong>
                        <small>
                          {t.devicesSub}
                        </small>
                      </span>

                      <ChevronRight
                        size={22}
                        strokeWidth={2.1}
                      />
                    </Link>
                  </nav>
                </section>
              </>
            ) : null}
          </>
        )}

        {modalOpen ? (
          <div className={styles.modalBackdrop}>
            <section
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="child-profile-title"
            >
              <div className={styles.modalHeader}>
                <div>
                  <p
                    className={styles.sectionLabel}
                  >
                    {t.childProfile}
                  </p>

                  <h2 id="child-profile-title">
                    {editingId
                      ? t.editChild
                      : t.addChildTitle}
                  </h2>
                </div>

                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X
                    size={24}
                    strokeWidth={2.2}
                  />
                </button>
              </div>

              <form
                className={styles.form}
                onSubmit={handleSubmit}
              >
                <label>
                  <span>{t.name}</span>

                  <input
                    type="text"
                    value={form.name}
                    maxLength={30}
                    autoFocus
                    placeholder={
                      t.childNamePlaceholder
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>{t.age}</span>

                  <input
                    type="number"
                    min={6}
                    max={15}
                    value={form.age}
                    placeholder="6–15"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        age: event.target.value,
                      }))
                    }
                  />
                </label>

                <p className={styles.formHint}>
                  {t.hint}
                </p>

                <div className={styles.formActions}>
                  <button
                    className={
                      styles.secondaryButton
                    }
                    type="button"
                    onClick={closeModal}
                  >
                    {t.cancel}
                  </button>

                  <button
                    className={styles.saveButton}
                    type="submit"
                  >
                    {editingId
                      ? t.save
                      : t.create}
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : null}
      </section>
    </MobileShell>
  );
}
