"use client";

import GalleryFilter from '@/components/gallery/GalleryFilter';
import GalleryHeader from '@/components/gallery/GalleryHeader';
import GalleryItem from '@/components/gallery/GalleryItem';
import GalleryLightbox from '@/components/gallery/GalleryLightbox';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import {
  GalleryItem as GalleryItemType,
  useDeleteFromGalleryMutation,
  useGetGalleryQuery,
  useUpdateGalleryMutation,
} from '@/features/gallery/galleryApi';
import { cn } from '@/lib/utils';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  FolderPlus,
  Image as ImageIcon,
  Trash2,
  Youtube
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import Loading from '../../components/Loading/Loading';

export default function GalleryPage() {
  const { data: items = [], isLoading, refetch } = useGetGalleryQuery(undefined);
  const [deleteItem] = useDeleteFromGalleryMutation();
  const [updateItem] = useUpdateGalleryMutation();

  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'youtube'>('all');
  const [search, setSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string>('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renamingItem, setRenamingItem] = useState<GalleryItemType | null>(null);
  const [newName, setNewName] = useState('');

  const [ytUrl, setYtUrl] = useState('');
  const [ytName, setYtName] = useState('');
  const [isAddingYt, setIsAddingYt] = useState(false);
  const [isSubmitingYt, setIsSubmittingYt] = useState(false);

  const handleAddYoutube = async () => {
    if (!ytUrl.trim()) return;
    setIsSubmittingYt(true);
    try {
      await axios.post('/api/gallery', {
        type: 'youtube',
        url: ytUrl.trim(),
        fileName: ytName.trim() || 'YouTube Video',
        folder: currentFolder === 'all' ? 'Root' : currentFolder
      });
      showMessage('YouTube intelligence logged.', 'success');
      setYtUrl('');
      setYtName('');
      setIsAddingYt(false);
      await refetch();
    } catch (_err) {
      showMessage('Failed to log transmission.', 'error');
    } finally {
      setIsSubmittingYt(false);
    }
  };

  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<{ current: number; total: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItemType | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const totalFiles = files.length;
    setUploadInfo({ current: 0, total: totalFiles });

    const uploadPromises = Array.from(files).map(async (file, index) => {
      if (file.size > 1024 * 1024 * 1024) {
        showMessage(`File ${file.name} exceeds 1GB limit.`, 'error');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      if (currentFolder !== 'all') {
        formData.append('folder', currentFolder);
      }

      try {
        await axios.post('/api/gallery', formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && totalFiles === 1) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        });
        setUploadInfo(prev => prev ? { ...prev, current: prev.current + 1 } : null);
      } catch (err: unknown) {
        console.error(`Upload failed for ${file.name}:`, err);
        showMessage(`Failed to upload ${file.name}`, 'error');
      }
    });

    await Promise.all(uploadPromises);

    await refetch();
    showMessage('Upload complete!', 'success');
    setUploading(false);
    setUploadInfo(null);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Permanently remove this unit?')) return;

    try {
      await deleteItem(id).unwrap();
      showMessage('Unit de-manifested.', 'success');
      setSelectedIds(prev => prev.filter(sid => sid !== id));
    } catch (err: unknown) {
      console.error('Delete failed:', err);
      showMessage('De-manifestation failed.', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} items?`)) return;

    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await deleteItem(id).unwrap();
        successCount++;
      } catch (err) {
        console.error(`Failed to delete ${id}`, err);
      }
    }

    showMessage(`Successfully removed ${successCount} units.`, 'success');
    setSelectedIds([]);
  };

  const handleRename = async () => {
    if (!renamingItem || !newName.trim()) return;

    try {
      await updateItem({ id: renamingItem._id, fileName: newName.trim() }).unwrap();
      showMessage('Registry updated.', 'success');
      setRenamingItem(null);
      setNewName('');
    } catch (_err) {
      showMessage('Update failed.', 'error');
    }
  };

  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    if (!customFolders.includes(newFolderName.trim())) {
      setCustomFolders(prev => [...prev, newFolderName.trim()]);
    }
    setCurrentFolder(newFolderName.trim());
    setNewFolderName('');
    setIsAddingFolder(false);
    showMessage(`Sector ${newFolderName.trim()} online.`, 'success');
  };

  const folders = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      if (item.folder) set.add(item.folder);
    });
    customFolders.forEach(folder => set.add(folder));
    return Array.from(set);
  }, [items, customFolders]);

  const filteredItems = useMemo(() => {
    return items.filter((item: GalleryItemType) => {
      const matchesFilter = filter === 'all' || item.type === filter;
      const matchesFolder = currentFolder === 'all' || item.folder === currentFolder;
      const matchesSearch = item.fileName.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesFolder && matchesSearch;
    });
  }, [items, filter, search, currentFolder]);

  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const handleDownload = (url: string, fileName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelect = (id: string, select: boolean) => {
    setSelectedIds(prev => select ? [...prev, id] : prev.filter(sid => sid !== id));
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-32">
        <GalleryHeader
          uploading={uploading}
          uploadInfo={uploadInfo}
          uploadProgress={uploadProgress}
          onUploadClick={() => fileInputRef.current?.click()}
          fileInputRef={fileInputRef}
          handleUpload={handleUpload}
        />

        {/* Bulk Actions & Folder Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 p-4 rounded-[2.5rem] border border-border/50">
          <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => setCurrentFolder('all')}
              className={cn(
                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer",
                currentFolder === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-accent/10 text-muted-foreground hover:bg-accent/20"
              )}
            >
              All Assets
            </button>
            {folders.map(folder => (
              <button
                key={folder}
                onClick={() => setCurrentFolder(folder)}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer",
                  currentFolder === folder ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-accent/10 text-muted-foreground hover:bg-accent/20"
                )}
              >
                {folder}
              </button>
            ))}
            <Button
              onClick={() => setIsAddingFolder(true)}
              variant="ghost"
              size="icon"
              className="rounded-xl h-10 w-10 shrink-0 cursor-pointer"
            >
              <FolderPlus className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsAddingYt(true)}
              variant="ghost"
              size="icon"
              className="rounded-xl h-10 w-10 shrink-0 cursor-pointer text-loss hover:bg-loss/10"
            >
              <Youtube className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-2 animate-in fade-in zoom-in duration-300 w-full md:w-auto">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest px-4">
                  {selectedIds.length} Selected
                </span>
                <Button
                  onClick={handleBulkDelete}
                  className="flex-1 md:flex-none h-11 px-6 rounded-2xl bg-loss/10 text-loss hover:bg-loss hover:text-white border border-loss/20 transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Bulk Destroy
                </Button>
                <Button
                  onClick={() => setSelectedIds([])}
                  variant="outline"
                  className="h-11 px-6 rounded-2xl border-border/50 font-black uppercase text-[10px] tracking-widest cursor-pointer"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        <GalleryFilter
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />

        {message && (
          <div className={cn(
            "fixed bottom-8 right-8 z-[200] flex items-center space-x-3 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5",
            message.type === 'success' ? 'bg-profit/10 text-profit border border-profit/20 backdrop-blur-xl' : 'bg-loss/10 text-loss border border-loss/20 backdrop-blur-xl'
          )}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-black uppercase text-xs tracking-widest">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full">
              <Loading />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-32 bg-card/40 border-4 border-dashed border-border/40 rounded-[50px] flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="p-10 rounded-full bg-accent/20">
                <ImageIcon className="w-20 h-20 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Null Sector</h3>
                <p className="text-sm font-bold italic">No intelligence found in this encrypted sector.</p>
              </div>
            </div>
          ) : (
            filteredItems.map((item: GalleryItemType) => (
              <GalleryItem
                key={item._id}
                item={item}
                isSelected={selectedIds.includes(item._id)}
                onSelect={toggleSelect}
                onRename={(item) => {
                  setRenamingItem(item);
                  setNewName(item.fileName);
                }}
                onPreview={setPreviewItem}
                onDelete={handleDelete}
                onDownload={handleDownload}
                formatSize={formatSize}
              />
            ))
          )}
        </div>

        {/* Modals & Dialogs */}
        {previewItem && (
          <GalleryLightbox
            item={previewItem}
            onClose={() => setPreviewItem(null)}
            onDownload={handleDownload}
            formatSize={formatSize}
          />
        )}

        <Dialog open={!!renamingItem} onOpenChange={(open) => !open && setRenamingItem(null)}>
          <DialogContent className="max-w-md rounded-[2.5rem] bg-card/90 backdrop-blur-2xl border-border/50 p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Update Registry</DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">Modify Asset Identification</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">New Descriptor</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new codename..."
                  className="h-14 rounded-2xl bg-accent/20 border-border/50 focus:border-primary transition-all font-bold text-lg px-6"
                />
              </div>
              <DialogFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setRenamingItem(null)}
                  className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/50 bg-transparent cursor-pointer"
                >
                  Abort
                </Button>
                <Button
                  onClick={handleRename}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Commit Changes
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingYt} onOpenChange={setIsAddingYt}>
          <DialogContent className="max-w-md rounded-[2.5rem] bg-card/90 backdrop-blur-2xl border-border/50 p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                <Youtube className="w-6 h-6 text-loss" />
                Add YouTube Link
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">Intercept External Transmission</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Video Identifier (URL)</label>
                <Input
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-14 rounded-2xl bg-accent/20 border-border/50 focus:border-primary transition-all font-bold text-sm px-6"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Asset Name (Optional)</label>
                <Input
                  value={ytName}
                  onChange={(e) => setYtName(e.target.value)}
                  placeholder="Enter video name..."
                  className="h-14 rounded-2xl bg-accent/20 border-border/50 focus:border-primary transition-all font-bold text-sm px-6"
                />
              </div>
              <DialogFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingYt(false)}
                  className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/50 bg-transparent cursor-pointer"
                >
                  Abort
                </Button>
                <Button
                  onClick={handleAddYoutube}
                  disabled={isSubmitingYt || !ytUrl.trim()}
                  className="flex-1 h-12 rounded-2xl bg-loss text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-loss/20 cursor-pointer"
                >
                  {isSubmitingYt ? 'Logging...' : 'Sync Asset'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
          <DialogContent className="max-w-md rounded-[2.5rem] bg-card/90 backdrop-blur-2xl border-border/50 p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                <FolderPlus className="w-6 h-6 text-primary" />
                Initialize New Sector
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">Allocate Storage Partition</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">Sector Designation (Name)</label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter sector name..."
                  className="h-14 rounded-2xl bg-accent/20 border-border/50 focus:border-primary transition-all font-bold text-sm px-6"
                />
              </div>
              <DialogFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingFolder(false)}
                  className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border/50 bg-transparent cursor-pointer"
                >
                  Abort
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Initialize Sector
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
