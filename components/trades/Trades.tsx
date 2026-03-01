"use client";

import DailyRecordForm from '@/components/forms/DailyRecordForm';
import MainLayout from '@/components/layout/MainLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddTradeMutation,
  useDeleteTradeMutation,
  useGetTradesQuery,
  useUpdateTradeMutation
} from '@/features/trades/tradesApi';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  FileSpreadsheet,
  Loader2,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const ITEMS_PER_PAGE = 10;

const getLocalDate = (isoDateString: string) => {
  if (!isoDateString) return new Date();
  const datePart = isoDateString.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
};

interface TradeRecord {
  _id: string;
  date: string;
  profit: number;
  loss: number;
  riskRewardRatio: string;
  notes?: string;
  tags?: string[];
  totalTrades: number;
  updatedAt?: string;
  createdAt?: string;
}

export default function Trades() {
  const searchParams = useSearchParams();
  const action = searchParams?.get('action');

  const { data: records = [], isLoading: isFetching } = useGetTradesQuery(undefined);
  const [addTrade, { isLoading: isAdding }] = useAddTradeMutation();
  const [updateTrade, { isLoading: isUpdating }] = useUpdateTradeMutation();
  const [deleteTrade] = useDeleteTradeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TradeRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<TradeRecord | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (action === 'add') {
      setIsModalOpen(true);
    }
  }, [action]);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredRecords = useMemo(() => {
    let result = records;

    if (search) {
      const searchTerm = search.toLowerCase();
      result = records.filter((r: TradeRecord) => {
        const dateStr = r.date.split('T')[0];
        const [year, month, day] = dateStr.split('-');

        // Date Search Logic
        const dateParts = searchTerm.split(/[-/]/);
        let dateMatch = false;

        if (dateParts.length === 1 && dateParts[0].length > 0) {
          // Match day or year or month (if specified as MM)
          dateMatch = day === dateParts[0].padStart(2, '0') || year === dateParts[0];
        } else if (dateParts.length === 2) {
          // DD-MM
          dateMatch = day === dateParts[0].padStart(2, '0') && month === dateParts[1].padStart(2, '0');
        } else if (dateParts.length === 3) {
          // DD-MM-YYYY
          dateMatch = day === dateParts[0].padStart(2, '0') && month === dateParts[1].padStart(2, '0') && year === dateParts[2];
        }

        const notesMatch = r.notes?.toLowerCase().includes(searchTerm);
        const tagsMatch = r.tags?.some((t: string) => t.toLowerCase().includes(searchTerm));
        const isoFormatMatch = dateStr.includes(searchTerm);

        return dateMatch || notesMatch || tagsMatch || isoFormatMatch;
      });
    }

    // Sort by updatedAt descending so the most recently touched record is always at the top
    return [...result].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || a.date).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || b.date).getTime();
      return timeB - timeA;
    });
  }, [records, search]);

  // Pagination Logic
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteTrade(deleteConfirmId).unwrap();
      setDeleteConfirmId(null);
    } catch {
      alert('Failed to delete record');
    }
  };

  const handleFormSubmit = async (formData: Partial<TradeRecord>) => {
    try {
      if (editingRecord) {
        await updateTrade({ id: editingRecord._id, ...formData }).unwrap();
      } else {
        await addTrade(formData).unwrap();
      }
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save record';
      alert(message);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl hidden md:block shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1">Trade Journal</h1>
              <p className="text-sm text-muted-foreground">Every entry here dynamically recalculates your dashboard statistics.</p>
            </div>
          </div>
          <Button
            onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}
            className="rounded-xl px-6 md:px-10 py-3 h-auto font-semibold tracking-wider cursor-pointer bg-primary w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Entry
          </Button>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 md:p-6 border-b border-border flex flex-col lg:flex-row items-center justify-between gap-4 bg-muted/20">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search date, notes, or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 bg-background border-border rounded-xl h-11 focus:ring-0 focus:outline-none font-normal"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-3 py-1.5 bg-muted rounded-lg border border-border">
                {filteredRecords.length} LOGS TOTAL
              </span>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-border whitespace-nowrap">
                  <TableHead className="px-4 md:px-8 py-5 font-semibold text-foreground h-auto text-sm md:text-base">Temporal Key</TableHead>
                  <TableHead className="px-4 md:px-6 py-5 font-semibold text-foreground text-right h-auto text-sm md:text-base">Net Surplus</TableHead>
                  <TableHead className="px-4 md:px-6 py-5 font-semibold text-foreground text-center h-auto text-sm md:text-base">Efficiency (R:R)</TableHead>
                  <TableHead className="px-4 md:px-6 py-5 font-semibold text-foreground h-auto text-sm md:text-base">Contextual Data</TableHead>
                  <TableHead className="px-4 md:px-6 py-5 font-semibold text-foreground text-right h-auto text-sm md:text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-primary h-12 w-12" />
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing Records...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-8 py-32 text-center text-muted-foreground">
                      <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                          <FileSpreadsheet size={40} />
                        </div>
                        <div>
                          <p className="font-black text-foreground uppercase tracking-tight text-lg">No matches found</p>
                          <p className="text-sm font-medium mt-1">Refine your search parameters or add new historical data.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedRecords.map((record: TradeRecord) => {
                  const net = (record.profit || 0) - (record.loss || 0);
                  const isProfit = net >= 0;
                  const isZeroRR = record.riskRewardRatio === '0:0';

                  return (
                    <TableRow key={record._id} className="hover:bg-accent/5 border-border group transition-colors">
                      <TableCell className="px-4 md:px-8">
                        <div className="font-bold md:font-normal text-xs md:text-sm whitespace-nowrap">{format(getLocalDate(record.date), 'MMM dd, yyyy')}</div>
                        <div className="text-[9px] md:text-[10px] text-muted-foreground mt-1 md:mt-1.5 flex items-center gap-2 font-black uppercase tracking-tighter opacity-70">
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          {record.totalTrades > 0 ? `${record.totalTrades} Trade(s)` : 'Single Record'}
                        </div>
                      </TableCell>
                      <TableCell className={`px-4 md:px-6 py-4 md:py-6 text-right font-black text-base md:text-lg ${isProfit ? 'text-profit' : 'text-loss'}`}>
                        <div className="flex items-center justify-end space-x-1 md:space-x-2">
                          {isProfit ? <TrendingUp size={16} className="md:w-5 md:h-5 stroke-[3]" /> : <TrendingDown size={16} className="md:w-5 md:h-5 stroke-[3]" />}
                          <span className="italic whitespace-nowrap">{isProfit ? '+' : '-'}${Math.abs(net).toLocaleString()}</span>
                        </div>
                        <div className="text-[8px] md:text-[9px] uppercase font-black tracking-widest opacity-40 mt-1">
                          {record.profit > 0 ? `IN: $${record.profit}` : `OUT: $${record.loss}`}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 md:px-6 py-4 md:py-6 text-center">
                        <span className={cn(
                          "px-3 md:px-5 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-black border uppercase tracking-tighter transition-all whitespace-nowrap",
                          isZeroRR
                            ? "bg-loss/10 text-loss border-loss/30 animate-pulse shadow-sm shadow-loss/10"
                            : "bg-primary/5 text-primary border-primary/20 shadow-sm shadow-primary/5"
                        )}>
                          {record.riskRewardRatio}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 md:px-6 py-4 md:py-6">
                        <p className="text-xs md:text-sm line-clamp-2 text-foreground font-normal leading-relaxed italic opacity-80">&quot;{record.notes || 'No contextual notes.'}&quot;</p>
                        <div className="flex flex-wrap gap-1">
                          {record.tags?.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="bg-muted/50 text-muted-foreground text-[8px] md:text-[9px] font-black px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg border border-border uppercase tracking-widest whitespace-nowrap">
                              {tag}
                            </span>
                          ))}
                          {record.tags && record.tags.length > 3 && (
                            <span className="text-[8px] font-bold text-muted-foreground">+{record.tags.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 md:px-6 py-4 md:py-6 text-right">
                        <div className="flex items-center justify-end space-x-1 md:space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewRecord(record)}
                            className="h-8 w-8 md:h-10 md:w-10 hover:bg-primary/20 cursor-pointer text-primary rounded-xl transition-all"
                          >
                            <Eye className="w-4 h-4 md:w-4.5 md:h-4.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingRecord(record); setIsModalOpen(true); }}
                            className="h-8 w-8 md:h-10 md:w-10 hover:bg-primary/20 cursor-pointer text-primary rounded-xl transition-all"
                          >
                            <Edit2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmId(record._id)}
                            className="h-8 w-8 md:h-10 md:w-10 hover:bg-loss/20 cursor-pointer text-loss rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between bg-muted/10 gap-4">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Displaying Page {currentPage} of {totalPages} Contexts
              </p>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-10 w-10 rounded-xl border-border bg-card shadow-sm disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1.5">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                        currentPage === i + 1
                          ? "bg-primary text-white shadow-lg shadow-primary/20 ring-2 ring-primary/20"
                          : "bg-card border border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-10 w-10 rounded-xl border-border bg-card shadow-sm disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setEditingRecord(null);
      }}>
        <DialogContent className="w-[95%] sm:max-w-2xl bg-card border-border rounded-2xl p-0 overflow-hidden shadow-2xl outline-none focus:ring-0">
          <DialogHeader className="p-4 md:p-6 border-b border-border text-left relative overflow-hidden bg-primary/5">
            <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
              {editingRecord ? 'Edit Trade' : 'Add Trade Record'}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm font-medium text-muted-foreground opacity-80">
              Database synchronization in progress.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <DailyRecordForm
              initialData={editingRecord ? {
                date: editingRecord.date,
                profit: editingRecord.profit,
                loss: editingRecord.loss,
                riskRewardRatio: editingRecord.riskRewardRatio,
                notes: editingRecord.notes,
                tags: editingRecord.tags
              } : null}
              onSubmit={handleFormSubmit}
              isLoading={isAdding || isUpdating}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal - FIXED COLOR */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogPortal>
          <AlertDialogOverlay className="backdrop-blur-sm bg-black/40" />
          <AlertDialogContent className="w-[70%] max-w-sm rounded-2xl p-6 outline-none flex flex-col items-center border-border shadow-2xl">

            <div className="flex flex-col items-center text-center w-full space-y-4">
              {/* ICON */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-loss/10 rounded-full flex items-center justify-center text-loss shadow-inner animate-pulse">
                <Trash2 size={28} className="md:w-8 md:h-8" />
              </div>

              {/* TEXT */}
              <div className="space-y-1.5">
                <AlertDialogTitle className="text-lg md:text-xl font-bold">
                  Delete Record?
                </AlertDialogTitle>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
                  This action is permanent and will affect your dashboard stats.
                </p>
              </div>
            </div>

            <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <AlertDialogCancel className="w-full text-red-500 hover:text-red-600 sm:w-auto rounded-xl font-bold uppercase tracking-widest px-6 py-2.5 h-auto cursor-pointer border-border hover:bg-accent transition-all text-[10px] m-0 order-2 sm:order-1">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white cursor-pointer rounded-xl font-bold uppercase tracking-widest px-6 py-2.5 h-auto shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] text-[10px] m-0 order-1 sm:order-2"
              >
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>

      {/* View Details Modal */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent className="w-[95%] sm:max-w-2xl bg-card border-border rounded-2xl p-0 overflow-hidden shadow-2xl outline-none focus:ring-0">
          {viewRecord && (
            <>
              <DialogHeader className="p-4 md:p-6 border-b border-border text-left relative overflow-hidden bg-primary/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <DialogTitle className="text-lg md:text-xl font-bold tracking-tight">
                      Trade Analysis
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium mt-2 text-[10px] md:text-xs uppercase tracking-wider">
                      Snapshot • {format(getLocalDate(viewRecord.date), 'MMMM dd, yyyy')}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-1.5 p-4 rounded-xl border border-border bg-accent/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Net Surplus</p>
                    <p className={cn("text-lg font-black", (viewRecord.profit - viewRecord.loss) >= 0 ? "text-profit" : "text-loss")}>
                      {(viewRecord.profit - viewRecord.loss) >= 0 ? '+' : '-'}${Math.abs(viewRecord.profit - viewRecord.loss).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-4 rounded-xl border border-border bg-accent/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Efficiency</p>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <p className="text-lg font-black">{viewRecord.riskRewardRatio}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 p-4 rounded-xl border border-border bg-accent/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Execution</p>
                    <p className="text-sm font-bold uppercase">{viewRecord.totalTrades > 0 ? `${viewRecord.totalTrades} Logs` : 'Single'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contextual Tags</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {viewRecord.tags?.map((tag: string) => (
                      <span key={tag} className="bg-muted/50 text-muted-foreground text-[10px] font-black px-3 py-1.5 rounded-xl border border-border uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Performance Notes</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
                      {viewRecord.notes || 'No contextual notes recorded for this execution.'}
                    </p>
                  </div>
                </div>
              </div>


            </>
          )}
        </DialogContent>
      </Dialog>

    </MainLayout>
  );
}
