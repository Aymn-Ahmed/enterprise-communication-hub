import { useCallback, useEffect, useMemo, useState } from 'react';
import { hubService } from '../services/hubService';
import type { LookUp, UserLookUp, HubTab } from '../types/hub.types';

type UseHubDataLoaderParams = {
    open: boolean;
    activeTab: HubTab;
    currentDisplayId: number;
    isMe: (id: number | string | undefined | null) => boolean;
    loadCounts: () => Promise<any> | void;
    loadConversations: () => Promise<any> | void;
    loadHubItems: () => Promise<any> | void;
    setAttachmentUrls: React.Dispatch<React.SetStateAction<string[]>>;
};

export function useHubDataLoader({
    open,
    activeTab,
    currentDisplayId,
    isMe,
    loadCounts,
    loadConversations,
    loadHubItems,
    setAttachmentUrls
}: UseHubDataLoaderParams) {
    const [departments, setDepartments] = useState<LookUp[]>([]);
    const [allUsers, setAllUsers] = useState<UserLookUp[]>([]);

    const loadUsers = useCallback(async () => {
        try {
            const res = await hubService.getUsersSimple();
            setAllUsers(res.data.map((u: any) => ({
                Id: u.displayId || u.DisplayId || u.id || u.Id,
                RawId: Number(u.id || u.Id || 0),
                Name: u.nameuser || u.nameUser || u.us_name || u.usName || 'مستخدم',
                WorkId: u.workId || u.WorkId || 0,
                AvatarUrl: u.AvatarUrl || u.avatarUrl || u.profilePictureUrl || u.ProfilePictureUrl || u.Url || u.UrlProfile || u.userAvatarUrl || ''
            })).filter((u: UserLookUp) => (u.Id > 0 || (u.RawId ?? 0) > 0) && !isMe(u.Id) && !isMe(u.RawId)));
        } catch {
            try {
                const res = await hubService.getUsersCrud();
                const data = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
                const mapped = data.map((u: any) => ({
                    Id: u.DisplayId ?? u.displayId ?? u.Id ?? u.id,
                    RawId: Number(u.Id ?? u.id ?? 0),
                    Name: u.nameuser ?? u.us_name ?? `مستخدم ${u.DisplayId ?? u.Id ?? u.id}`,
                    WorkId: u.WorkId ?? u.workId ?? 0,
                    LastActiveAt: u.LastActiveAt ?? u.lastActiveAt,
                    AvatarUrl: u.AvatarUrl ?? u.avatarUrl ?? ''
                })).filter((u: UserLookUp) => (u.Id > 0 || (u.RawId ?? 0) > 0) && !isMe(u.Id) && !isMe(u.RawId));
                setAllUsers(mapped);
            } catch (err2) {
                console.error('Error loading users', err2);
            }
        }
    }, [isMe]);

    const loadDepartments = useCallback(async () => {
        try {
            const res = await hubService.getWorkTypes();
            const data = Array.isArray(res.data) ? res.data : [];
            const mapped = data.map((d: any) => ({
                Id: d.WT_ID ?? d.wT_ID ?? d.Wt_Id ?? d.wt_id ?? d.id ?? d.Id ?? 0,
                Name: d.WT_NameAr ?? d.wT_NameAr ?? d.wt_NameAr ?? d.Wt_NameAr ?? d.nameAr ?? d.Name ?? `القسم ${d.WT_ID ?? d.id}`
            })).filter((d: LookUp) => d.Id > 0 && d.Name);
            mapped.sort((a: LookUp, b: LookUp) => a.Name.localeCompare(b.Name));
            setDepartments(mapped);
        } catch (err: any) {
            console.error('Error loading departments', err);
            try {
                const res = await hubService.getWorkTypesCrud();
                const data = Array.isArray(res.data) ? res.data : (res.data?.items ?? res.data?.data ?? []);
                const mapped = data.map((d: any) => ({
                    Id: d.WT_ID ?? d.wT_ID ?? d.Wt_Id ?? d.wt_id ?? d.id ?? d.Id ?? 0,
                    Name: d.WT_NameAr ?? d.wT_NameAr ?? d.wt_NameAr ?? d.Wt_NameAr ?? d.nameAr ?? d.Name ?? `القسم ${d.WT_ID ?? d.id}`
                })).filter((d: LookUp) => d.Id > 0 && d.Name);
                mapped.sort((a: LookUp, b: LookUp) => a.Name.localeCompare(b.Name));
                setDepartments(mapped);
            } catch (err2) {
                console.error('Error loading departments from CRUD', err2);
                setDepartments([]);
            }
        }
    }, []);

    useEffect(() => {
        if (activeTab) {
            if (departments.length === 0) loadDepartments();
            if (allUsers.length === 0) loadUsers();
        }
    }, [activeTab, departments.length, allUsers.length, loadDepartments, loadUsers]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!open) return;
            setAttachmentUrls([]);
            try {
                await loadCounts();
                if (activeTab) {
                    await loadConversations();
                    await loadHubItems();
                }
            } catch (err) {
                console.error('[CommunicationHub] sequential load error:', err);
            }
        };
        loadInitialData();
    }, [open, activeTab, loadCounts, loadConversations, loadHubItems, setAttachmentUrls]);

    const filteredUsers = useMemo(
        () => allUsers.filter(u => Number(u.Id) !== Number(currentDisplayId)),
        [allUsers, currentDisplayId]
    );

    const handleFullRefresh = useCallback(() => {
        loadCounts();
        loadUsers();
        loadDepartments();
        loadConversations();
        if (activeTab) loadHubItems();
    }, [loadCounts, loadUsers, loadDepartments, loadConversations, activeTab, loadHubItems]);

    return {
        departments,
        allUsers,
        setAllUsers,
        loadUsers,
        loadDepartments,
        filteredUsers,
        handleFullRefresh
    };
}
