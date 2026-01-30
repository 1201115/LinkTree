"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import LinkCard from "../../components/LinkCard";
import { getIconForUrl } from "../../lib/icon";

const WorldMap = dynamic(() => import("../../components/WorldMap"), { ssr: false });

type LinkItem = {
  id: string;
  title: string;
  url: string;
};

type PlaceItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  countryCode?: string | null;
};

type PublicProfile = {
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
const getAccentStyle = (profile: PublicProfile) => {
  const hue = profile.accentHue ?? 260;
  const opacity = profile.overlayOpacity ?? 0.35;
  const blur = profile.overlayBlur ?? 18;

  return {
    background: `linear-gradient(180deg, hsla(${hue}, 85%, 60%, ${opacity}) 0%, rgba(11, 15, 26, 0.95) 70%)`,
    backdropFilter: `blur(${blur}px)`
  } as React.CSSProperties;
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/public/${params.username}`);
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
    }
    if (params?.username) loadProfile();
  }, [params]);

  if (!profile) {
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="glass rounded-3xl p-8">Perfil não encontrado.</div>
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
        <header className="text-center space-y-3">
          <div className="mx-auto h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-2xl overflow-hidden">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
            ) : (
              profile.displayName.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-white/60">{profile.bio}</p>
          </div>
        </header>

        <section className="space-y-3">
          {profile.links.map((link) => {
            const Icon = getIconForUrl(link.url);
            return <LinkCard key={link.id} title={link.title} href={link.url} icon={<Icon />} />;
          })}
        </section>

        <section className="glass rounded-3xl p-4">
          <WorldMap places={profile.places} />
        </section>
      </div>
    </main>
  );
}
