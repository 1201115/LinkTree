import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
  FaGlobe,
  FaSpotify,
  FaGithub
} from "react-icons/fa";
import { HiOutlineLink } from "react-icons/hi";

export function getIconForUrl(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes("instagram")) return FaInstagram;
  if (lower.includes("tiktok")) return FaTiktok;
  if (lower.includes("youtube")) return FaYoutube;
  if (lower.includes("linkedin")) return FaLinkedin;
  if (lower.includes("spotify")) return FaSpotify;
  if (lower.includes("github")) return FaGithub;
  return lower.includes("http") ? FaGlobe : HiOutlineLink;
}
