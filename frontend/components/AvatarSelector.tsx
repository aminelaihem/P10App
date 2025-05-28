// components/AvatarSelector.tsx
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { gqlClient } from "@/lib/gqlClient";

interface Avatar {
  id: string;
  pictureAvatarUrl: string;
}

interface AvatarSelectorProps {
  onSelect: (avatarId: string) => void;
  selectedAvatarId?: string;
}

const GET_AVAILABLE_AVATARS = `
  query GetAvailableAvatars {
    availableAvatars {
      id
      pictureAvatarUrl
    }
  }
`;

export default function AvatarSelector({ onSelect, selectedAvatarId }: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await gqlClient(GET_AVAILABLE_AVATARS);
        setAvatars(response.availableAvatars);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des avatars");
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="loader-f1-red" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="input-group-f1 p-4 flex-wrap">
      <div className="w-full flex items-center gap-2 mb-3">
        <FaUserCircle className="text-f1red text-xl" />
        <span className="text-white/90">Choisissez votre avatar</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full">
        {avatars.map((avatar: Avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 
              ${selectedAvatarId === avatar.id 
                ? "ring-4 ring-f1red scale-105" 
                : "ring-2 ring-white/20 hover:ring-white/40"}`}
          >
            <Image
              src={avatar.pictureAvatarUrl}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}