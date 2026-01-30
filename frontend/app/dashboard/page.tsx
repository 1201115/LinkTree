"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { apiFetch } from "../../lib/api";
import { getIconForUrl } from "../../lib/icon";
import LinkCard from "../../components/LinkCard";

const WorldMap = dynamic(() => import("../../components/WorldMap"), { ssr: false });

type LinkItem = {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
};

type PlaceItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  countryCode?: string | null;
};

type Suggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type Profile = {
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  theme?: string | null;
  accentHue?: number | null;
  overlayOpacity?: number | null;
  overlayBlur?: number | null;
  links: LinkItem[];
  places: PlaceItem[];
};
const getAccentStyle = (profile: Profile) => {
  const hue = profile.accentHue ?? 260;
  const opacity = profile.overlayOpacity ?? 0.35;
  const blur = profile.overlayBlur ?? 18;

  return {
    background: `linear-gradient(180deg, hsla(${hue}, 85%, 60%, ${opacity}) 0%, rgba(11, 15, 26, 0.95) 70%)`,
    backdropFilter: `blur(${blur}px)`
  } as React.CSSProperties;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [linkForm, setLinkForm] = useState({ title: "", url: "" });
  const [placeForm, setPlaceForm] = useState({ name: "", lat: "", lng: "" });
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, { title: string; url: string }>>({});
  const [placeDrafts, setPlaceDrafts] = useState<Record<string, { name: string; lat: string; lng: string }>>({});
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<null | "title" | "bio" | "avatar" | "background" | "theme">(null);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const profileSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const linkSaveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const placeSaveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const initialLoad = useRef(true);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as Suggestion[];
          setSuggestions(data);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  async function loadProfile() {
    const res = await apiFetch("/me");
    if (!res.ok) return;
    const data = await res.json();
    setProfile(data);
  }

  async function handleAddLink() {
    if (!linkForm.title || !linkForm.url) return;
    await apiFetch("/links", {
      method: "POST",
      body: JSON.stringify({ title: linkForm.title, url: linkForm.url })
    });
    setLinkForm({ title: "", url: "" });
    loadProfile();
  }

  async function handleAddPlace() {
    if (!placeForm.name || !placeForm.lat || !placeForm.lng) return;
    await apiFetch("/places", {
      method: "POST",
      body: JSON.stringify({
        name: placeForm.name,
        lat: Number(placeForm.lat),
        lng: Number(placeForm.lng)
      })
    });
    setPlaceForm({ name: "", lat: "", lng: "" });
    setQuery("");
    setSuggestions([]);
    loadProfile();
  }

  async function handleDeleteLink(id: string) {
    await apiFetch(`/links/${id}`, { method: "DELETE" });
    setEditingLinkId(null);
    loadProfile();
  }

  async function handleDeletePlace(id: string) {
    await apiFetch(`/places/${id}`, { method: "DELETE" });
    setEditingPlaceId(null);
    loadProfile();
  }

  useEffect(() => {
    if (!profile) return;
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    if (profileSaveTimeout.current) {
      clearTimeout(profileSaveTimeout.current);
    }

    profileSaveTimeout.current = setTimeout(async () => {
      await apiFetch("/me", {
        method: "PUT",
        body: JSON.stringify({
          displayName: profile.displayName,
          bio: profile.bio || null,
          avatarUrl: profile.avatarUrl || null,
          backgroundUrl: profile.backgroundUrl || null,
          theme: profile.theme || "aurora",
          accentHue: profile.accentHue ?? 260,
          overlayOpacity: profile.overlayOpacity ?? 0.35,
          overlayBlur: profile.overlayBlur ?? 18
        })
      });
    }, 700);
  }, [
    profile?.displayName,
    profile?.bio,
    profile?.avatarUrl,
    profile?.backgroundUrl,
    profile?.theme,
    profile?.accentHue,
    profile?.overlayOpacity,
    profile?.overlayBlur,
    profile
  ]);

  useEffect(() => {
    if (!profile || !editingLinkId) return;
    const draft = linkDrafts[editingLinkId];
    const original = profile.links.find((link) => link.id === editingLinkId);
    if (!draft || !original) return;
    if (draft.title === original.title && draft.url === original.url) return;

    if (linkSaveTimeouts.current[editingLinkId]) {
      clearTimeout(linkSaveTimeouts.current[editingLinkId]);
    }

    linkSaveTimeouts.current[editingLinkId] = setTimeout(async () => {
      await apiFetch(`/links/${editingLinkId}`, {
        method: "PUT",
        body: JSON.stringify({ title: draft.title, url: draft.url })
      });
      loadProfile();
    }, 600);
  }, [linkDrafts, editingLinkId, profile]);

  useEffect(() => {
    if (!profile || !editingPlaceId) return;
    const draft = placeDrafts[editingPlaceId];
    const original = profile.places.find((place) => place.id === editingPlaceId);
    if (!draft || !original) return;
    if (draft.name === original.name && draft.lat === String(original.lat) && draft.lng === String(original.lng)) return;

    if (placeSaveTimeouts.current[editingPlaceId]) {
      clearTimeout(placeSaveTimeouts.current[editingPlaceId]);
    }

    placeSaveTimeouts.current[editingPlaceId] = setTimeout(async () => {
      await apiFetch(`/places/${editingPlaceId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: draft.name,
          lat: Number(draft.lat),
          lng: Number(draft.lng)
        })
      });
      loadProfile();
    }, 600);
  }, [placeDrafts, editingPlaceId, profile]);

  useEffect(() => {
    if (!activeEditor) return;

    function handleClickOutside(event: MouseEvent) {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setActiveEditor(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeEditor]);

  const publicUrl = useMemo(() => {
    if (!profile) return "";
    return `/${profile.username}`;
  }, [profile]);

  if (!profile) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="glass rounded-3xl p-8">A carregar...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-6 py-12 overflow-hidden">
      <div className="absolute inset-0 -z-10" style={getAccentStyle(profile)} />
      {profile.backgroundUrl && (
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.backgroundUrl})` }}
        />
      )}
      <div className="mx-auto max-w-lg space-y-8">
        <header className="flex items-center justify-between">
          <div className="text-sm text-white/60">Modo edição</div>
          <div className="flex gap-2">
            <Link className="btn-secondary" href={publicUrl}>Ver público</Link>
            <button
              className="btn-primary"
              onClick={async () => {
                await apiFetch("/auth/logout", { method: "POST" });
                location.href = "/";
              }}
            >
              Sair
            </button>
          </div>
        </header>

        <section className="text-center space-y-3">
          <button
            className="mx-auto h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-2xl overflow-hidden"
            onClick={() => setActiveEditor("avatar")}
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
            ) : (
              profile.displayName.charAt(0)
            )}
          </button>
          <button className="block w-full text-2xl font-bold" onClick={() => setActiveEditor("title")}>
            {profile.displayName}
          </button>
          <button className="block w-full text-sm text-white/60" onClick={() => setActiveEditor("bio")}>
            {profile.bio || "Adicionar descrição"}
          </button>
          <div className="flex justify-center gap-2">
            <button className="btn-secondary" onClick={() => setActiveEditor("background")}>
              Editar fundo
            </button>
            <button className="btn-secondary" onClick={() => setActiveEditor("theme")}>
              Mudar cores
            </button>
          </div>
        </section>

        {activeEditor && (
          <div ref={editorRef} className="glass rounded-2xl p-4 space-y-3">
            {activeEditor === "title" && (
              <input
                className="input"
                placeholder="Título público"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              />
            )}
            {activeEditor === "bio" && (
              <input
                className="input"
                placeholder="Descrição"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            )}
            {activeEditor === "avatar" && (
              <input
                className="input"
                placeholder="URL da foto de perfil"
                value={profile.avatarUrl || ""}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
              />
            )}
            {activeEditor === "background" && (
              <input
                className="input"
                placeholder="URL da foto de fundo"
                value={profile.backgroundUrl || ""}
                onChange={(e) => setProfile({ ...profile, backgroundUrl: e.target.value })}
              />
            )}
            {activeEditor === "theme" && (
              <div className="space-y-3">
                <div className="text-xs text-white/60">Hue</div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={profile.accentHue ?? 260}
                  onChange={(e) => setProfile({ ...profile, accentHue: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-white/60">Transparência</div>
                <input
                  type="range"
                  min={0}
                  max={0.7}
                  step={0.01}
                  value={profile.overlayOpacity ?? 0.35}
                  onChange={(e) => setProfile({ ...profile, overlayOpacity: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-white/60">Blur</div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={1}
                  value={profile.overlayBlur ?? 18}
                  onChange={(e) => setProfile({ ...profile, overlayBlur: Number(e.target.value) })}
                  className="w-full"
                />
                <button
                  className="btn-secondary w-full"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      overlayOpacity: 0,
                      overlayBlur: profile.overlayBlur ?? 18
                    })
                  }
                >
                  Sem overlay
                </button>
              </div>
            )}
          </div>
        )}

        <section className="space-y-3">
          {profile.links.map((link) => {
            const Icon = getIconForUrl(link.url);
            const draft = linkDrafts[link.id] || { title: link.title, url: link.url };
            const isEditing = editingLinkId === link.id;
            return (
              <div key={link.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <LinkCard title={link.title} href={link.url} icon={<Icon />} />
                  </div>
                  <button className="btn-secondary" onClick={() => setEditingLinkId(isEditing ? null : link.id)}>
                    {isEditing ? "Fechar" : "Editar"}
                  </button>
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        className="input"
                        placeholder="Título"
                        value={draft.title}
                        onChange={(e) =>
                          setLinkDrafts({
                            ...linkDrafts,
                            [link.id]: { ...draft, title: e.target.value }
                          })
                        }
                      />
                      <input
                        className="input"
                        placeholder="URL"
                        value={draft.url}
                        onChange={(e) =>
                          setLinkDrafts({
                            ...linkDrafts,
                            [link.id]: { ...draft, url: e.target.value }
                          })
                        }
                      />
                    </div>
                    <button className="btn-secondary" onClick={() => handleDeleteLink(link.id)}>Remover</button>
                  </div>
                )}
              </div>
            );
          })}
          <div className="glass rounded-2xl p-4 space-y-3">
            <button className="btn-secondary w-full" onClick={() => setShowAddLink(!showAddLink)}>
              + Adicionar link
            </button>
            {showAddLink && (
              <div className="space-y-3">
                <input className="input" placeholder="Título" value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} />
                <input className="input" placeholder="URL" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} />
                <button className="btn-secondary" onClick={handleAddLink}>Adicionar link</button>
              </div>
            )}
          </div>
        </section>

        <section className="glass rounded-3xl p-4 space-y-4">
          <WorldMap places={profile.places} />
          <div className="space-y-3">
            {profile.places.map((place) => {
              const draft =
                placeDrafts[place.id] ||
                { name: place.name, lat: String(place.lat), lng: String(place.lng) };
              const isEditing = editingPlaceId === place.id;
              return (
                <div key={place.id} className="glass rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/70">{place.name}</div>
                    <button className="btn-secondary" onClick={() => setEditingPlaceId(isEditing ? null : place.id)}>
                      {isEditing ? "Fechar" : "Editar"}
                    </button>
                  </div>
                  {isEditing && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          className="input"
                          placeholder="Cidade"
                          value={draft.name}
                          onChange={(e) =>
                            setPlaceDrafts({
                              ...placeDrafts,
                              [place.id]: { ...draft, name: e.target.value }
                            })
                          }
                        />
                        <input
                          className="input"
                          placeholder="Latitude"
                          value={draft.lat}
                          onChange={(e) =>
                            setPlaceDrafts({
                              ...placeDrafts,
                              [place.id]: { ...draft, lat: e.target.value }
                            })
                          }
                        />
                        <input
                          className="input"
                          placeholder="Longitude"
                          value={draft.lng}
                          onChange={(e) =>
                            setPlaceDrafts({
                              ...placeDrafts,
                              [place.id]: { ...draft, lng: e.target.value }
                            })
                          }
                        />
                      </div>
                      <button className="btn-secondary" onClick={() => handleDeletePlace(place.id)}>Remover</button>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="glass rounded-2xl p-4 space-y-3">
              <button className="btn-secondary w-full" onClick={() => setShowAddPlace(!showAddPlace)}>
                + Adicionar destino
              </button>
              {showAddPlace && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      className="input"
                      placeholder="Cidade ou país"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPlaceForm({ ...placeForm, name: e.target.value });
                      }}
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-3 text-xs text-white/50">A procurar…</div>
                    )}
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 mt-2 w-full rounded-2xl border border-white/10 bg-ink/90 p-2 shadow-lg">
                        {suggestions.map((item) => (
                          <button
                            key={item.place_id}
                            type="button"
                            className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                            onClick={() => {
                              setQuery(item.display_name);
                              setPlaceForm({
                                name: item.display_name,
                                lat: item.lat,
                                lng: item.lon
                              });
                              setSuggestions([]);
                            }}
                          >
                            {item.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input" placeholder="Latitude" value={placeForm.lat} onChange={(e) => setPlaceForm({ ...placeForm, lat: e.target.value })} />
                    <input className="input" placeholder="Longitude" value={placeForm.lng} onChange={(e) => setPlaceForm({ ...placeForm, lng: e.target.value })} />
                  </div>
                  <button className="btn-secondary w-full" onClick={handleAddPlace}>
                    Adicionar
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
