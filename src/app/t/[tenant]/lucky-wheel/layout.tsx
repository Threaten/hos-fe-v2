import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lucky Wheel",
  description:
    "Spin the lucky wheel and win exclusive dining rewards at House of Senses.",
};

export default function LuckyWheelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
