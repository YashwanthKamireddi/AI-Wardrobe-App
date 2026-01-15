import { useState } from "react";
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Eye,
  Lock,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WardrobeItem } from "@shared/schema";

interface OpenClosetUser {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  followerCount: number;
  styleTag?: string;
}

interface OpenClosetOutfit {
  id: string;
  user: OpenClosetUser;
  items: WardrobeItem[];
  likes: number;
  saves: number;
  occasion?: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface OpenClosetCardProps {
  outfit: OpenClosetOutfit;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  onStealLook?: (items: WardrobeItem[]) => void;
  compact?: boolean;
}

export function OpenClosetCard({
  outfit,
  onLike,
  onSave,
  onStealLook,
  compact = false,
}: OpenClosetCardProps) {
  const [liked, setLiked] = useState(outfit.isLiked || false);
  const [saved, setSaved] = useState(outfit.isSaved || false);
  const [showItems, setShowItems] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onLike?.(outfit.id);
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.(outfit.id);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return (
      <div
        className="rounded-xl overflow-hidden transition-all hover:shadow-lg"
        style={{
          background: "white",
          border: "1px solid var(--color-pearl)",
        }}
      >
        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-0.5 aspect-square">
          {outfit.items.slice(0, 4).map((item, i) => (
            <div
              key={item.id || i}
              className="overflow-hidden"
              style={{ background: "var(--color-cashmere)" }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          ))}
        </div>

        {/* Mini Footer */}
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{
                background: "var(--color-cashmere)",
                color: "var(--color-charcoal)",
              }}
            >
              {outfit.user.avatar ? (
                <img
                  src={outfit.user.avatar}
                  alt={outfit.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(outfit.user.name)
              )}
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--color-charcoal)" }}>
              {outfit.user.name.split(" ")[0]}
            </span>
          </div>
          <button
            onClick={handleLike}
            className={cn(
              "p-1 rounded transition-all",
              liked && "heart-pop"
            )}
          >
            <Heart
              className={cn("h-4 w-4", liked && "fill-current")}
              style={{ color: liked ? "var(--color-error)" : "var(--color-taupe)" }}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: "white",
        border: "1px solid var(--color-pearl)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--color-pearl)" }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              background: "var(--color-cashmere)",
              color: "var(--color-charcoal)",
            }}
          >
            {outfit.user.avatar ? (
              <img
                src={outfit.user.avatar}
                alt={outfit.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(outfit.user.name)
            )}
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-charcoal)" }}>
              {outfit.user.name}
            </p>
            <p className="text-xs" style={{ color: "var(--color-graphite)" }}>
              @{outfit.user.handle}
            </p>
          </div>
        </div>

        {/* Style Tag */}
        {outfit.user.styleTag && (
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: "rgba(212, 175, 55, 0.1)",
              color: "var(--color-gold-muted)",
              border: "1px solid rgba(212, 175, 55, 0.2)",
            }}
          >
            {outfit.user.styleTag}
          </span>
        )}
      </div>

      {/* Image Grid */}
      <div
        className="grid grid-cols-3 gap-0.5"
        style={{ background: "var(--color-pearl)" }}
      >
        {outfit.items.slice(0, 6).map((item, i) => (
          <div
            key={item.id || i}
            className={cn(
              "aspect-square overflow-hidden relative group cursor-pointer",
              i === 0 && outfit.items.length >= 3 && "col-span-2 row-span-2"
            )}
            style={{ background: "var(--color-cashmere)" }}
            onClick={() => setShowItems(!showItems)}
          >
            {item.imageUrl ? (
              <>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="h-6 w-6" style={{ color: "var(--color-taupe)" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Occasion Tag */}
      {outfit.occasion && (
        <div className="px-4 pt-3">
          <span
            className="text-xs font-medium px-2 py-1 rounded-lg inline-block"
            style={{
              background: "var(--color-cashmere)",
              color: "var(--color-graphite)",
            }}
          >
            {outfit.occasion}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1 transition-all",
                liked && "heart-pop"
              )}
            >
              <Heart
                className={cn("h-5 w-5", liked && "fill-current")}
                style={{ color: liked ? "#E53E3E" : "var(--color-graphite)" }}
              />
              <span className="text-sm" style={{ color: "var(--color-graphite)" }}>
                {outfit.likes + (liked ? 1 : 0)}
              </span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1 transition-all"
            >
              <Bookmark
                className={cn("h-5 w-5", saved && "fill-current")}
                style={{ color: saved ? "var(--color-gold-muted)" : "var(--color-graphite)" }}
              />
              <span className="text-sm" style={{ color: "var(--color-graphite)" }}>
                {outfit.saves + (saved ? 1 : 0)}
              </span>
            </button>

            <button className="flex items-center gap-1">
              <Share2 className="h-5 w-5" style={{ color: "var(--color-graphite)" }} />
            </button>
          </div>

          <button
            onClick={() => onStealLook?.(outfit.items)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all press-feedback"
            style={{
              background: "var(--color-obsidian)",
              color: "var(--color-alabaster)",
            }}
          >
            <Copy className="h-4 w-4" />
            <span className="text-sm font-medium">Steal This Look</span>
          </button>
        </div>
      </div>

      {/* Expanded Items View */}
      {showItems && (
        <div
          className="p-4 space-y-2 animate-fade-up"
          style={{ borderTop: "1px solid var(--color-pearl)" }}
        >
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-3"
            style={{ color: "var(--color-graphite)" }}
          >
            Items in this look
          </p>
          {outfit.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg"
              style={{ background: "var(--color-cashmere)" }}
            >
              <div
                className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: "white" }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--color-charcoal)" }}>
                  {item.name}
                </p>
                <p className="text-xs" style={{ color: "var(--color-graphite)" }}>
                  {item.brand || item.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Community Feed Component
interface StyleChallenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  endDate: string;
  badge?: string;
}

interface StyleChallengeCardProps {
  challenge: StyleChallenge;
  onJoin?: (id: string) => void;
}

export function StyleChallengeCard({ challenge, onJoin }: StyleChallengeCardProps) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-cashmere) 0%, white 100%)",
        border: "1px solid var(--color-pearl)",
      }}
    >
      {/* Decorative Glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        {/* Badge */}
        {challenge.badge && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full mb-3"
            style={{
              background: "rgba(212, 175, 55, 0.15)",
              color: "#8B7730",
              border: "1px solid rgba(212, 175, 55, 0.3)",
            }}
          >
            <Sparkles className="h-3 w-3" />
            {challenge.badge}
          </span>
        )}

        <h3
          className="text-lg font-semibold mb-1"
          style={{ color: "var(--color-charcoal)" }}
        >
          {challenge.title}
        </h3>

        <p className="text-sm mb-3" style={{ color: "var(--color-graphite)" }}>
          {challenge.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-graphite)" }}>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {challenge.participants} joined
            </span>
            <span>Ends {challenge.endDate}</span>
          </div>

          <button
            onClick={() => onJoin?.(challenge.id)}
            className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg transition-all press-feedback"
            style={{
              background: "var(--color-obsidian)",
              color: "var(--color-alabaster)",
            }}
          >
            Join
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OpenClosetCard;
