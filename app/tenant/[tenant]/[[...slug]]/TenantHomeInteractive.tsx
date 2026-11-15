"use client";

import { useState } from "react";
import NewMenuModal from "../../../(main)/components/NewMenuModal";

interface NewMenuImage {
  src?: {
    url: string;
    filename: string;
  };
  id?: string;
}

/** Client-only part of the branch home page: the "what's new" modal */
export default function TenantHomeInteractive({
  newMenu,
  tenantName,
}: {
  newMenu: NewMenuImage[];
  tenantName: string;
}) {
  const [open, setOpen] = useState(newMenu != null && newMenu.length > 0);
  return (
    <NewMenuModal images={newMenu} isOpen={open} onClose={() => setOpen(false)} tenantName={tenantName} />
  );
}
