"use client";

import { Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { MobileShell } from "../components/ui";
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

const STORAGE_KEY = "liio-parent-child-profiles";

export default function ParentsHomePage() {
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
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as ChildProfile[];

        if (Array.isArray(parsed)) {
          setProfiles(parsed);

          if (parsed.length > 0) {
            setSelectedId(parsed[0].id);
          }
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles, ready]);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedId) ?? null,
    [profiles, selectedId],
  );

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const age = Number(form.age);

    if (!name || !Number.isInteger(age) || age < 6 || age > 15) {
      return;
    }

    if (editingId) {
      setProfiles((current) =>
        current.map((profile) =>
          profile.id === editingId
            ? {
                ...profile,
                name,
                age,
              }
            : profile,
        ),
      );
    } else {
      const newProfile: ChildProfile = {
        id: crypto.randomUUID(),
        name,
        age,
      };

      setProfiles((current) => [...current, newProfile]);
      setSelectedId(newProfile.id);
    }

    closeModal();
  }

  function removeProfile(profile: ChildProfile) {
    const confirmed = window.confirm(
      `Remove ${profile.name}'s profile from this device?`,
    );

    if (!confirmed) {
      return;
    }

    setProfiles((current) => {
      const nextProfiles = current.filter(
        (currentProfile) => currentProfile.id !== profile.id,
      );

      if (selectedId === profile.id) {
        setSelectedId(nextProfiles[0]?.id ?? null);
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
            <p className={styles.eyebrow}>Family</p>
            <h1>Parents</h1>
          </div>

          <button
            className={styles.headerAdd}
            type="button"
            onClick={openCreateProfile}
            aria-label="Add child"
          >
            <Plus size={24} strokeWidth={2.3} />
          </button>
        </header>

        {profiles.length === 0 ? (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <UserRound size={36} strokeWidth={1.8} />
            </div>

            <h2>No child profiles yet</h2>

            <p>
              Add your first child to start setting up their Liio experience.
            </p>

            <button
              className={styles.primaryButton}
              type="button"
              onClick={openCreateProfile}
            >
              <Plus size={20} strokeWidth={2.4} />
              Add child
            </button>
          </section>
        ) : (
          <>
            <section className={styles.profilesSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionLabel}>Children</p>
                  <span className={styles.sectionDescription}>
                    Choose a profile to manage
                  </span>
                </div>

                <button
                  className={styles.textButton}
                  type="button"
                  onClick={openCreateProfile}
                >
                  Add
                </button>
              </div>

              <div className={styles.profileList}>
                {profiles.map((profile) => {
                  const active = profile.id === selectedId;

                  return (
                    <button
                      key={profile.id}
                      type="button"
                      className={`${styles.profileCard} ${
                        active ? styles.profileCardActive : ""
                      }`}
                      onClick={() => setSelectedId(profile.id)}
                    >
                      <span className={styles.avatar}>
                        {profile.name.charAt(0).toUpperCase()}
                      </span>

                      <span className={styles.profileCopy}>
                        <strong>{profile.name}</strong>
                        <small>{profile.age} years old</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedProfile ? (
              <section className={styles.profileDetails}>
                <div className={styles.profileDetailsTop}>
                  <div>
                    <p className={styles.sectionLabel}>Profile</p>
                    <h2>{selectedProfile.name}</h2>
                    <span>{selectedProfile.age} years old</span>
                  </div>

                  <div className={styles.profileAvatarLarge}>
                    {selectedProfile.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className={styles.profileActions}>
                  <button
                    type="button"
                    onClick={() => openEditProfile(selectedProfile)}
                  >
                    <Pencil size={19} strokeWidth={2.2} />
                    Edit profile
                  </button>

                  <button
                    className={styles.dangerButton}
                    type="button"
                    onClick={() => removeProfile(selectedProfile)}
                  >
                    <Trash2 size={19} strokeWidth={2.2} />
                    Remove
                  </button>
                </div>
              </section>
            ) : null}

            <section className={styles.futureSection}>
              <p className={styles.sectionLabel}>Liio</p>

              <div className={styles.futureCard}>
                <strong>No activity yet</strong>
                <span>
                  Learning activity, limits and device information will appear
                  here once this profile starts using Liio.
                </span>
              </div>
            </section>
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
                  <p className={styles.sectionLabel}>Child profile</p>

                  <h2 id="child-profile-title">
                    {editingId ? "Edit child" : "Add child"}
                  </h2>
                </div>

                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X size={24} strokeWidth={2.2} />
                </button>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  <span>Name</span>

                  <input
                    type="text"
                    value={form.name}
                    maxLength={30}
                    autoFocus
                    placeholder="Child's name"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>Age</span>

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
                  Liio currently supports learning profiles from 6 to 15 years
                  old.
                </p>

                <div className={styles.formActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button className={styles.saveButton} type="submit">
                    {editingId ? "Save changes" : "Create profile"}
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