import React, { useState, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { ProfileHeroCard } from "./components/ProfileHeroCard";
import { ProfileDetailsTab } from "./components/ProfileDetailsTab";
import { AccessRolesSection } from "./components/AccessRolesSection";
import { EditProfileModal } from "./components/EditProfileModal";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { Building, ShieldCheck, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getAdminsRoster, saveAdminsRoster } from "@/features/admins/data/mockAdminsData";
import { AdminRosterItem } from "@/features/admins/types";
import { UserProfile } from "@/types";

type ProfileTabId = "overview" | "permissions";

const iosSpringTransition = {
  type: "spring" as const,
  stiffness: 440,
  damping: 32,
  mass: 0.65,
};

const iosContentTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.75,
};

export const AdminProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const tabParam = searchParams.get("tab") as ProfileTabId;
  const initialTab: ProfileTabId = tabParam === "permissions" ? "permissions" : "overview";
  const [activeTab, setActiveTab] = useState<ProfileTabId>(initialTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const adminProfile = useAppStore((state) => state.adminProfile);
  const updateAdminProfile = useAppStore((state) => state.updateAdminProfile);
  const resetAdminProfile = useAppStore((state) => state.resetAdminProfile);

  // Check if viewing a specific admin from TotalAdminsPage
  const adminIdParam = searchParams.get("id") || searchParams.get("adminId");
  const passedAdmin = location.state?.admin as AdminRosterItem | undefined;

  const currentRosterAdmin = useMemo<AdminRosterItem | null>(() => {
    if (passedAdmin) return passedAdmin;
    if (adminIdParam) {
      const roster = getAdminsRoster();
      return roster.find((a) => a.id === adminIdParam || a.employeeId === adminIdParam) || null;
    }
    return null;
  }, [adminIdParam, passedAdmin]);

  const displayedUser: UserProfile = useMemo(() => {
    if (!currentRosterAdmin) return adminProfile;
    return {
      name: currentRosterAdmin.name,
      role: currentRosterAdmin.role,
      email: currentRosterAdmin.email,
      avatarUrl: currentRosterAdmin.avatarUrl || "/avis-emblem.png",
      college: "Avis World College",
      amsVersion: adminProfile.amsVersion || "v2.4.0",
      city: currentRosterAdmin.city || currentRosterAdmin.location,
      state: currentRosterAdmin.state || "",
      country: currentRosterAdmin.country || "India",
      phone: currentRosterAdmin.phone,
      bio: currentRosterAdmin.bio || `Administrator assigned to ${currentRosterAdmin.department}.`,
      department: currentRosterAdmin.department,
      joinedDate: currentRosterAdmin.joinedDate,
      status: currentRosterAdmin.status,
    };
  }, [currentRosterAdmin, adminProfile]);

  const handleTabChange = (tabId: ProfileTabId) => {
    setActiveTab(tabId);
    const newParams: Record<string, string> = { tab: tabId };
    if (adminIdParam) {
      newParams.id = adminIdParam;
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSaveProfile = (updated: Partial<UserProfile>) => {
    if (currentRosterAdmin) {
      const roster = getAdminsRoster();
      const updatedRoster = roster.map((adm) => {
        if (adm.id === currentRosterAdmin.id) {
          return {
            ...adm,
            name: updated.name ?? adm.name,
            email: updated.email ?? adm.email,
            phone: updated.phone ?? adm.phone,
            department: updated.department ?? adm.department,
            country: updated.country ?? adm.country,
            location: updated.city ?? adm.location,
            bio: updated.bio ?? adm.bio,
            role: updated.role ?? adm.role,
          };
        }
        return adm;
      });
      saveAdminsRoster(updatedRoster);
    }
    updateAdminProfile(updated);
  };

  const tabs = [
    { id: "overview" as const, label: "Profile Overview", icon: Building },
    { id: "permissions" as const, label: "Access Roles", icon: ShieldCheck },
  ];

  return (
    <motion.div
      variants={dashboardContainerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full pt-1"
    >
      {/* 1. Breadcrumb Banner */}
      <BreadcrumbBanner
        title={currentRosterAdmin ? `${displayedUser.name}` : "Admin Profile"}
        items={
          currentRosterAdmin
            ? [{ name: "Admin", path: "/admins" }, { name: "Total Admins", path: "/admins" }, { name: displayedUser.name }]
            : [{ name: "Admin Profile" }]
        }
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="rounded-xl px-3 text-[11px] font-semibold shadow-sm sm:text-[12px]"
          >
            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> <span>Edit Profile</span>
          </Button>
        }
      />

      {/* 2. Hero Profile Card with Avis Branding */}
      <motion.div variants={dashboardSectionVariants}>
        <ProfileHeroCard
          user={displayedUser}
          onEditClick={() => setIsEditModalOpen(true)}
        />
      </motion.div>

      {/* 3. Navigation Tabs Pill Bar - iOS Segmented Liquid Spring */}
      <motion.div
        variants={dashboardSectionVariants}
        className="mb-4"
      >
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-[22px] border border-brand-border/80 bg-white/90 p-1.5 shadow-[0_2px_12px_-2px_rgba(66,27,41,0.05)] backdrop-blur-md">
          <LayoutGroup id="admin-profile-segmented-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "group relative flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[16px] px-4 py-1.5 text-[10px] font-semibold transition-colors duration-200 sm:text-[12px]",
                    isActive ? "text-white" : "text-text-secondary hover:bg-brand-bg/60 hover:text-text-primary",
                  )}
                >
                  {/* Sliding Liquid Spring Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="admin-profile-active-tab-indicator"
                      className="absolute inset-0 z-0 overflow-hidden rounded-[16px] border border-white/25 bg-gradient-to-r from-burgundy-primary via-[#571D2F] to-brand-red shadow-[0_4px_16px_-2px_rgba(112,43,64,0.32),0_2px_6px_-1px_rgba(166,76,97,0.22)]"
                      transition={iosSpringTransition}
                    >
                      {/* Gliding Specular Glass Sheen */}
                      <div className="ios-liquid-sheen-active pointer-events-none absolute inset-0 z-10 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </motion.div>
                  )}

                  {/* Icon & Label with Spring Pop */}
                  <span className="relative z-10 flex items-center gap-2">
                    <motion.span
                      animate={{ scale: isActive ? 1.08 : 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 25 }}
                      className={cn("transition-colors duration-200", isActive ? "text-white" : "text-brand-red group-hover:scale-105")}
                    >
                      <Icon className="h-3 w-3" />
                    </motion.span>
                    <span className={cn("transition-all duration-200", isActive && "font-bold tracking-tight")}>{tab.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </LayoutGroup>
        </div>
      </motion.div>

      {/* 4. Tab Views with Framer Motion AnimatePresence */}
      <motion.div variants={dashboardSectionVariants}>
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={iosContentTransition}
              className="space-y-6"
            >
              <ProfileDetailsTab
                user={displayedUser}
                onEditClick={() => setIsEditModalOpen(true)}
              />
              <AccessRolesSection />
            </motion.div>
          )}

          {activeTab === "permissions" && (
            <motion.div
              key="tab-permissions"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={iosContentTransition}
            >
              <AccessRolesSection />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 5. Edit Profile Interactive Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={displayedUser}
        onSave={handleSaveProfile}
        onResetDefaults={() => resetAdminProfile()}
      />
    </motion.div>
  );
};

export default AdminProfilePage;
