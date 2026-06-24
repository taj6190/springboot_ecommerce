'use client';

import api from '@/lib/api';
import { brandApi } from '@/services/brandService';
import { categoryApi } from '@/services/categoryService';
import { productApi } from '@/services/productService';
import { uploadApi } from '@/services/uploadService';
import type { ApiResponse } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Image, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

const variantSchema = z.object({
    sku: z.string().min(1, 'SKU required'),
    size: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    weight: z.string().optional(),
    price: z.coerce.number().min(0),
    discountPrice: z.coerce.number().optional(),
    stockQuantity: z.coerce.number().min(0),
    active: z.boolean().optional(),
    imageUrl: z.string().optional(),
});

const faqSchema = z.object({
    question: z.string().min(1, 'Question required'),
    answer: z.string().min(1, 'Answer required'),
    displayOrder: z.coerce.number().optional(),
});

const specSchema = z.object({
    key: z.string().min(1, 'Label required'),
    value: z.string().min(1, 'Value required'),
});

const imageSchema = z.object({
    imageUrl: z.string().min(1, 'URL required'),
    altText: z.string().optional(),
    displayOrder: z.coerce.number().optional(),
    isMain: z.boolean().optional(),
});

const schema = z.object({
    // Basic
    nameEn: z.string().min(2, 'Name is required'),
    nameBn: z.string().optional(),
    shortDescEn: z.string().optional(),
    shortDescBn: z.string().optional(),
    longDescEn: z.string().optional(),
    longDescBn: z.string().optional(),
    sku: z.string().min(1, 'SKU is required'),
    // Pricing
    mainPrice: z.coerce.number().min(1, 'Price is required'),
    discountPrice: z.coerce.number().optional(),
    costPrice: z.coerce.number().optional(),
    // Stock
    stockQuantity: z.coerce.number().min(0),
    lowStockThreshold: z.coerce.number().optional(),
    // Classification
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    productType: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    // Flags
    featured: z.boolean().optional(),
    trending: z.boolean().optional(),
    bestSeller: z.boolean().optional(),
    // Flash Sale
    flashSaleActive: z.boolean().optional(),
    // SEO
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    // Variants
    variants: z.array(variantSchema).optional(),
    // FAQs
    faqs: z.array(faqSchema).optional(),
    // Specifications
    specifications: z.array(specSchema).optional(),
    // Media
    images: z.array(imageSchema).optional(),
    mainImageUrl: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ProductFormPage() {
    const router = useRouter();
    const params = useParams();
    const qc = useQueryClient();
    const isEdit = params.id !== 'new';
    const productId = isEdit ? (params.id as string) : null;
    const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'media' | 'variants' | 'specs' | 'seo' | 'faqs'>('basic');

    const { data: product } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productApi.getById(productId!),
        enabled: isEdit,
    });

    const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll() });
    const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => brandApi.getAll() });
    const { data: tags } = useQuery({
        queryKey: ['tags-list'],
        queryFn: () => api.get<ApiResponse<{ id: string; name: string }[]>>('/admin/tags').then(r => r.data),
    });

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            status: 'DRAFT', stockQuantity: 0, lowStockThreshold: 5,
            variants: [], faqs: [], specifications: [], images: [],
            featured: false, trending: false, bestSeller: false, flashSaleActive: false
        },
    });

    const { fields: variantFields, append: addVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });
    const { fields: faqFields, append: addFaq, remove: removeFaq } = useFieldArray({ control, name: 'faqs' });
    const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({ control, name: 'specifications' });
    const { fields: imageFields, append: addImage, remove: removeImage } = useFieldArray({ control, name: 'images' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (product?.data) {
            const p = product.data;
            reset({
                nameEn: p.nameEn, nameBn: p.nameBn ?? '',
                shortDescEn: (p as any).shortDescEn ?? '', shortDescBn: (p as any).shortDescBn ?? '',
                longDescEn: (p as any).longDescEn ?? '', longDescBn: (p as any).longDescBn ?? '',
                sku: p.sku, mainPrice: p.mainPrice, discountPrice: p.discountPrice ?? undefined,
                costPrice: p.costPrice ?? undefined, stockQuantity: p.stockQuantity,
                lowStockThreshold: (p as any).lowStockThreshold ?? 5,
                categoryId: p.categoryId ?? '', brandId: p.brandId ?? '',
                productType: (p as any).productType ?? '', status: p.status,
                featured: p.featured, trending: p.trending, bestSeller: p.bestSeller,
                flashSaleActive: p.flashSaleActive,
                seoTitle: (p as any).seoTitle ?? '', seoDescription: (p as any).seoDescription ?? '',
                metaKeywords: (p as any).metaKeywords ?? '',
                variants: (p as any).variants ?? [], faqs: (p as any).faqs ?? [],
                specifications: (p as any).specifications ?? [],
                images: (p as any).images ?? [],
            });
        }
    }, [product, reset]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        const toastId = toast.loading(`Uploading ${files.length} images...`);
        try {
            for (let i = 0; i < files.length; i++) {
                const url = await uploadApi.upload(files[i], 'products');
                addImage({
                    imageUrl: url, altText: '',
                    displayOrder: imageFields.length + i,
                    isMain: imageFields.length === 0 && i === 0
                });
            }
            toast.success('Images uploaded', { id: toastId });
        } catch { toast.error('Upload failed', { id: toastId }); }
        finally { setUploading(false); if (e.target) e.target.value = ''; }
    };

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const toastId = toast.loading('Uploading main image...');
        try {
            const url = await uploadApi.upload(file, 'products');
            setValue('mainImageUrl', url);
            toast.success('Main image uploaded', { id: toastId });
        } catch { toast.error('Upload failed', { id: toastId }); }
        finally { setUploading(false); if (e.target) e.target.value = ''; }
    };

    const setMainImage = (index: number) => {
        imageFields.forEach((_, i) => {
            setValue(`images.${i}.isMain` as any, i === index);
        });
    };

    const handleVariantImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const toastId = toast.loading('Uploading variant image...');
        try {
            const url = await uploadApi.upload(file, 'products');
            setValue(`variants.${idx}.imageUrl` as any, url);
            toast.success('Uploaded', { id: toastId });
        } catch { toast.error('Upload failed', { id: toastId }); }
        finally { setUploading(false); if (e.target) e.target.value = ''; }
    };

    const createMut = useMutation({
        mutationFn: (data: FormData) => productApi.create(data as any),
        onSuccess: () => { toast.success('Product created!'); qc.invalidateQueries({ queryKey: ['products'] }); router.push('/dashboard/products'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });

    const updateMut = useMutation({
        mutationFn: (data: FormData) => productApi.update(productId!, data as any),
        onSuccess: () => { toast.success('Product updated!'); qc.invalidateQueries({ queryKey: ['products'] }); router.push('/dashboard/products'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });

    const onSubmit = (data: FormData) => {
        const mainImg = data.images?.find(img => img.isMain);
        if (mainImg) {
            data.mainImageUrl = mainImg.imageUrl;
        } else if (data.images && data.images.length > 0) {
            data.mainImageUrl = data.images[0].imageUrl;
            data.images[0].isMain = true;
        }
        if (isEdit) updateMut.mutate(data);
        else createMut.mutate(data);
    };

    const tabs = [
        { key: 'basic', label: 'Basic Info' },
        { key: 'pricing', label: 'Pricing & Stock' },
        { key: 'media', label: 'Media' },
        { key: 'variants', label: `Variants (${variantFields.length})` },
        { key: 'specs', label: `Specifications (${specFields.length})` },
        { key: 'seo', label: 'SEO' },
        { key: 'faqs', label: `FAQs (${faqFields.length})` },
    ] as const;

    const renderCategoryOptions = (categories: any[], level = 0): React.ReactNode[] => {
        return categories.flatMap((cat: any) => [
            <option key={cat.id} value={cat.id}>
                {Array(level).fill('—').join('')} {cat.nameEn}
            </option>,
            ...(cat.children ? renderCategoryOptions(cat.children, level + 1) : []),
        ]);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/products" className="p-2 rounded-lg hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-xl font-bold text-white">{isEdit ? 'Edit Product' : 'New Product'}</h1>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 overflow-x-auto pb-1">
                {tabs.map(t => (
                    <button key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.key ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* ─── Basic Info Tab ──────────────────────────────────── */}
                {activeTab === 'basic' && (
                    <div className="card p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Product Name (EN) *</label>
                                <input {...register('nameEn')} className="input" placeholder="Samsung Galaxy S24" />
                                {errors.nameEn && <p className="text-xs text-red-400 mt-1">{errors.nameEn.message}</p>}
                            </div>
                            <div>
                                <label className="label">Product Name (BN)</label>
                                <input {...register('nameBn')} className="input" placeholder="বাংলা নাম" />
                            </div>
                            <div>
                                <label className="label">SKU *</label>
                                <input {...register('sku')} className="input font-mono" placeholder="SGS24-001" />
                                {errors.sku && <p className="text-xs text-red-400 mt-1">{errors.sku.message}</p>}
                            </div>
                            <div>
                                <label className="label">Product Type</label>
                                <input {...register('productType')} className="input" placeholder="Electronics, Clothing..." />
                            </div>
                            <div>
                                <label className="label">Status *</label>
                                <select {...register('status')} className="input">
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Category</label>
                                <select {...register('categoryId')} className="input">
                                    <option value="">-- Select --</option>
                                    {renderCategoryOptions(cats?.data ?? [])}
                                </select>
                            </div>
                            <div>
                                <label className="label">Brand</label>
                                <select {...register('brandId')} className="input">
                                    <option value="">-- Select --</option>
                                    {((brands?.data as any)?.content || []).map((b: any) => (
                                        <option key={b.id} value={b.id}>{b.nameEn}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label">Short Description (EN)</label>
                            <textarea {...register('shortDescEn')} className="input" rows={3} placeholder="Brief product overview..." />
                        </div>
                        <div>
                            <label className="label">Short Description (BN)</label>
                            <textarea {...register('shortDescBn')} className="input" rows={3} placeholder="বাংলায় সংক্ষিপ্ত বিবরণ..." />
                        </div>
                        <div>
                            <label className="label">Full Description (EN)</label>
                            <textarea {...register('longDescEn')} className="input" rows={6} placeholder="Detailed product description..." />
                        </div>
                        <div>
                            <label className="label">Full Description (BN)</label>
                            <textarea {...register('longDescBn')} className="input" rows={6} placeholder="বিস্তারিত বাংলায় বিবরণ..." />
                        </div>
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                <input type="checkbox" {...register('featured')} className="w-4 h-4 accent-indigo-500" /> Featured
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                <input type="checkbox" {...register('trending')} className="w-4 h-4 accent-indigo-500" /> Trending
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                <input type="checkbox" {...register('bestSeller')} className="w-4 h-4 accent-indigo-500" /> Best Seller
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                <input type="checkbox" {...register('flashSaleActive')} className="w-4 h-4 accent-orange-500" /> Flash Sale Active
                            </label>
                        </div>
                    </div>
                )}

                {/* ─── Pricing & Stock Tab ────────────────────────────── */}
                {activeTab === 'pricing' && (
                    <div className="card p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Pricing & Stock</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="label">Main Price (৳) *</label>
                                <input {...register('mainPrice')} type="number" className="input" />
                                {errors.mainPrice && <p className="text-xs text-red-400 mt-1">{errors.mainPrice.message}</p>}
                            </div>
                            <div>
                                <label className="label">Discount Price (৳)</label>
                                <input {...register('discountPrice')} type="number" className="input" />
                            </div>
                            <div>
                                <label className="label">Cost Price (৳)</label>
                                <input {...register('costPrice')} type="number" className="input" />
                            </div>
                            <div>
                                <label className="label">Stock Quantity *</label>
                                <input {...register('stockQuantity')} type="number" className="input" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Low Stock Threshold</label>
                                <input {...register('lowStockThreshold')} type="number" className="input" />
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Alert when stock falls below this number</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Media Tab ──────────────────────────────────────── */}
                {activeTab === 'media' && (
                    <div className="card p-6 space-y-8">
                        {/* Main Product Image (Category Pattern) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Main Product Image</h3>
                            <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-hover)]">
                                <div className="w-40 h-40 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden relative group">
                                    {watch('mainImageUrl') ? (
                                        <img src={watch('mainImageUrl')} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Image size={32} className="text-[var(--text-muted)]" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => document.getElementById('main-image-upload')?.click()} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40">
                                            <Upload size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4 w-full">
                                    <div>
                                        <input type="file" accept="image/*" className="hidden" id="main-image-upload" onChange={handleMainImageUpload} />
                                        <button type="button" onClick={() => document.getElementById('main-image-upload')?.click()} disabled={uploading}
                                            className="btn-secondary text-sm">
                                            {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload New Image</>}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="label text-[10px]">Or Paste Main Image URL</label>
                                        <input {...register('mainImageUrl')} className="input text-sm" placeholder="https://example.com/image.jpg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Gallery */}
                        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Product Gallery</h3>
                                <span className="text-xs text-[var(--text-muted)]">{imageFields.length} images</span>
                            </div>

                            {imageFields.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {imageFields.map((field, idx) => (
                                        <div key={field.id} className="relative group rounded-xl overflow-hidden aspect-square border border-[var(--border)] bg-[var(--bg-hover)]">
                                            <img src={watch(`images.${idx}.imageUrl`)} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-full transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:border-[var(--accent)]" style={{ borderColor: 'var(--border)' }}>
                                    <Image size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                                    <p className="text-xs text-white font-medium mb-1">Upload Gallery Images</p>
                                    <input type="file" multiple accept="image/*" className="hidden" id="gallery-upload" onChange={handleImageUpload} disabled={uploading} />
                                    <button type="button" onClick={() => document.getElementById('gallery-upload')?.click()} className="text-[10px] text-[var(--accent)] hover:underline">
                                        Click to browse
                                    </button>
                                </div>

                                <div className="w-full md:w-80 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] space-y-3">
                                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Add from URL</h4>
                                    <div className="flex gap-2">
                                        <input id="gallery-url-input" className="input text-xs h-9" placeholder="https://..." />
                                        <button type="button" onClick={() => {
                                            const input = document.getElementById('gallery-url-input') as HTMLInputElement;
                                            if (input.value) {
                                                addImage({ imageUrl: input.value, altText: '', displayOrder: imageFields.length, isMain: false });
                                                input.value = '';
                                            }
                                        }} className="btn-secondary h-9 px-3">Add</button>
                                    </div>
                                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Paste URL and click add to include in gallery</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Variants Tab ───────────────────────────────────── */}
                {activeTab === 'variants' && (
                    <div className="card p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                Product Variants ({variantFields.length})
                            </h3>
                            <button type="button" onClick={() => addVariant({ sku: '', size: '', color: '', material: '', weight: '', price: 0, stockQuantity: 0, active: true })}
                                className="btn-secondary text-xs">
                                <Plus size={14} /> Add Variant
                            </button>
                        </div>
                        {variantFields.length === 0 ? (
                            <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                                <p className="text-sm">No variants added yet.</p>
                                <p className="text-xs mt-1">Add variants for size, color, and material options.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {variantFields.map((field, idx) => (
                                    <div key={field.id} className="rounded-lg p-4 space-y-4" style={{ background: 'var(--bg-hover)' }}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-white uppercase">Variant #{idx + 1}</span>
                                            <button type="button" onClick={() => removeVariant(idx)} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-5">
                                            {/* Variant Image */}
                                            <div className="w-full md:w-32 space-y-2">
                                                <label className="label">Variant Image</label>
                                                <div className="w-full aspect-square rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden relative group">
                                                    {watch(`variants.${idx}.imageUrl`) ? (
                                                        <img src={watch(`variants.${idx}.imageUrl`)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Image size={24} className="text-[var(--text-muted)]" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button type="button" onClick={() => document.getElementById(`variant-image-${idx}`)?.click()} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40">
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <input type="file" accept="image/*" className="hidden" id={`variant-image-${idx}`} onChange={(e) => handleVariantImageUpload(idx, e)} />
                                                <input {...register(`variants.${idx}.imageUrl`)} className="input text-[10px] h-8" placeholder="Paste URL..." />
                                            </div>

                                            {/* Variant Details */}
                                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="label">SKU *</label>
                                                    <input {...register(`variants.${idx}.sku`)} className="input text-sm" placeholder="SGS24-RED-M" />
                                                </div>
                                                <div>
                                                    <label className="label">Size</label>
                                                    <input {...register(`variants.${idx}.size`)} className="input text-sm" placeholder="M, L, XL" />
                                                </div>
                                                <div>
                                                    <label className="label">Color</label>
                                                    <input {...register(`variants.${idx}.color`)} className="input text-sm" placeholder="Red, Blue" />
                                                </div>
                                                <div>
                                                    <label className="label">Material</label>
                                                    <input {...register(`variants.${idx}.material`)} className="input text-sm" placeholder="Cotton" />
                                                </div>
                                                <div>
                                                    <label className="label">Weight</label>
                                                    <input {...register(`variants.${idx}.weight`)} className="input text-sm" placeholder="200g" />
                                                </div>
                                                <div>
                                                    <label className="label">Price (৳) *</label>
                                                    <input {...register(`variants.${idx}.price`)} type="number" className="input text-sm" />
                                                </div>
                                                <div>
                                                    <label className="label">Discount (৳)</label>
                                                    <input {...register(`variants.${idx}.discountPrice`)} type="number" className="input text-sm" />
                                                </div>
                                                <div>
                                                    <label className="label">Stock *</label>
                                                    <input {...register(`variants.${idx}.stockQuantity`)} type="number" className="input text-sm" />
                                                </div>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-2 text-sm text-white cursor-pointer w-fit">
                                            <input type="checkbox" {...register(`variants.${idx}.active`)} className="w-3.5 h-3.5 accent-indigo-500" /> Active
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Specifications Tab ─────────────────────────────── */}
                {activeTab === 'specs' && (
                    <div className="card p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                    Product Specifications ({specFields.length})
                                </h3>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                    Key-value pairs like Display, RAM, Battery, Storage, etc.
                                </p>
                            </div>
                            <button type="button" onClick={() => addSpec({ key: '', value: '' })}
                                className="btn-secondary text-xs">
                                <Plus size={14} /> Add Spec
                            </button>
                        </div>
                        {specFields.length === 0 ? (
                            <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                                <p className="text-sm">No specifications added yet.</p>
                                <p className="text-xs mt-1">Examples: Display → 6.7&quot; AMOLED, RAM → 8GB, Battery → 5000mAh</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {specFields.map((field, idx) => (
                                    <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-hover)' }}>
                                        <div className="flex-1">
                                            <input {...register(`specifications.${idx}.key`)} className="input text-sm" placeholder="Label (e.g. Display, RAM, Battery)" />
                                        </div>
                                        <div className="flex-1">
                                            <input {...register(`specifications.${idx}.value`)} className="input text-sm" placeholder='Value (e.g. 6.7" AMOLED, 8GB)' />
                                        </div>
                                        <button type="button" onClick={() => removeSpec(idx)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded flex-shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="pt-2">
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Common specifications:</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {['Display', 'RAM', 'Storage', 'Battery', 'Camera', 'Processor', 'OS', 'Weight', 'Dimensions', 'Connectivity', 'Warranty'].map(s => (
                                    <button key={s} type="button"
                                        onClick={() => addSpec({ key: s, value: '' })}
                                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                                        style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                        + {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── SEO Tab ────────────────────────────────────────── */}
                {activeTab === 'seo' && (
                    <div className="card p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Search Engine Optimization</h3>
                        <div className="rounded-lg p-4 space-y-2" style={{ background: 'var(--bg-hover)' }}>
                            <p className="text-sm font-medium text-blue-400">{watch('seoTitle') || watch('nameEn') || 'Page Title'}</p>
                            <p className="text-xs text-green-400">nexora.com/products/{watch('sku')?.toLowerCase().replace(/\s+/g, '-') || 'product-slug'}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{watch('seoDescription') || 'Add a meta description to improve search rankings...'}</p>
                        </div>
                        <div>
                            <label className="label">SEO Title</label>
                            <input {...register('seoTitle')} className="input" placeholder="Custom title for search engines" />
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Recommended: 50-60 characters</p>
                        </div>
                        <div>
                            <label className="label">SEO Description</label>
                            <textarea {...register('seoDescription')} className="input" rows={3} placeholder="Brief meta description for search results" />
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Recommended: 150-160 characters</p>
                        </div>
                        <div>
                            <label className="label">Meta Keywords</label>
                            <input {...register('metaKeywords')} className="input" placeholder="phone, samsung, galaxy, s24, smartphone" />
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Comma-separated keywords</p>
                        </div>
                    </div>
                )}

                {/* ─── FAQs Tab ───────────────────────────────────────── */}
                {activeTab === 'faqs' && (
                    <div className="card p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Product FAQs ({faqFields.length})</h3>
                            <button type="button" onClick={() => addFaq({ question: '', answer: '', displayOrder: faqFields.length })}
                                className="btn-secondary text-xs">
                                <Plus size={14} /> Add FAQ
                            </button>
                        </div>
                        {faqFields.length === 0 ? (
                            <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                                <p className="text-sm">No FAQs added yet.</p>
                                <p className="text-xs mt-1">Add common questions and answers about this product.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {faqFields.map((field, idx) => (
                                    <div key={field.id} className="rounded-lg p-4 space-y-3" style={{ background: 'var(--bg-hover)' }}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-white">Q&A #{idx + 1}</span>
                                            <button type="button" onClick={() => removeFaq(idx)} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
                                        </div>
                                        <div>
                                            <label className="label">Question *</label>
                                            <input {...register(`faqs.${idx}.question`)} className="input text-sm" placeholder="Is this product waterproof?" />
                                        </div>
                                        <div>
                                            <label className="label">Answer *</label>
                                            <textarea {...register(`faqs.${idx}.answer`)} className="input text-sm" rows={2} placeholder="Yes, this product is IP68 waterproof." />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Submit ─────────────────────────────────────────── */}
                <div className="flex justify-end gap-3 mt-6">
                    <Link href="/dashboard/products" className="btn-secondary">Cancel</Link>
                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                        {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            : <><Save size={16} /> {isEdit ? 'Update Product' : 'Create Product'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
