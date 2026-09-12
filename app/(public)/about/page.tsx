import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About the Founder" };
export const dynamic = "force-dynamic";

async function cfg(key: string, fallback = "") {
  const row = await prisma.siteConfig.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export default async function AboutPage() {
  const [name, title, bio, photoUrl, vision, mission, message, whyCreated] = await Promise.all([
    cfg("founder_name", "Ibrahim S. Kamara"),
    cfg("founder_title", "Founder & Visionary"),
    cfg(
      "founder_bio",
      "Mr. Ibrahim S. Kamara is a proud Temne son, community leader and a passionate advocate for the development of the Temne people. He is the founder of Maseray Temne Blogger, created to bring our people together, share our culture and support the community."
    ),
    cfg("founder_photo_url", "/logo.png"),
    cfg("founder_vision", "A united and empowered Temne community."),
    cfg("founder_mission", "To share information, promote our culture and support community development."),
    cfg("founder_message", '"Together, we can build a stronger, brighter future for our people." — Ibrahim S. Kamara'),
    cfg("founder_why", "To connect, inform and support the Temne community."),
  ]);

  return (
    <>
      {/* Founder Hero */}
      <div className="founder-hero">
        <div className="founder-hero-inner">
          <img
            src={photoUrl}
            alt={name}
            className="founder-photo"
            onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
          />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-400)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              About the Founder
            </div>
            <div className="founder-name">{name}</div>
            <div className="founder-title">{title}</div>
            <p className="founder-bio">{bio}</p>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="founder-pillars">
        {[
          { icon: "🌱", heading: "Why Maseray Was Created", body: whyCreated },
          { icon: "👁️", heading: "Vision", body: vision },
          { icon: "🎯", heading: "Mission", body: mission },
          { icon: "💬", heading: "Message", body: message },
        ].map(({ icon, heading, body }) => (
          <div key={heading} className="founder-pillar">
            <div className="founder-pillar-icon">{icon}</div>
            <h3>{heading}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--navy-800), var(--green-800))",
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--white)",
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
          Join the Community
        </h2>
        <p style={{ color: "var(--navy-200)", marginBottom: 28, fontSize: 15 }}>
          Be part of something bigger — contribute to the fund and help your fellow members.
        </p>
        <a href="/contribute" className="btn-primary">
          💳 Make a Contribution
        </a>
      </div>
    </>
  );
}
