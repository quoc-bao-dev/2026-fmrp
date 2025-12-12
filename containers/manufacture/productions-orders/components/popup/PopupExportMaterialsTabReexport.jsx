import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { ApproximateEqualsIcon, CloseXIcon, MagnifyingGlassIcon, PlusIcon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import NoData from '@/components/UI/noData/nodata';
import { IMAGES } from '@/constants/images';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { useProductionOrderDetail } from '@/managers/api/productions-order/useProductionOrderDetail';
import { useListSuggestPo } from '@/managers/api/productions-order/useSuggestPo';
import Image from 'next/image';
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { IoIosAlert } from 'react-icons/io';
import { Tooltip } from 'react-tippy';
import ErrorNVLBanner from './shared/ErrorNVLBanner';
import ProductSelectionSidebar from './shared/ProductSelectionSidebar';
import WarehouseLotRow from './shared/WarehouseLotRow';
import formatNumber from '@/utils/helpers/formatnumber';

const EMPTY_LOT_ROW = {
  lot: '',
  expiration_date: '',
  id_warehouse_custom: '',
  total_quantity: 0,
  quantity: 0,
  quantity_enter: 0,
};

const createUniqueRowId = () => `lot-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createLotRow = (warehouses = []) => ({
  id: createUniqueRowId(),
  ...EMPTY_LOT_ROW,
  list_warehouses: warehouses,
});

const normalizeString = value => {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const PopupExportMaterialsTabReexport = forwardRef(
  (
    {
      poId,
      onSelectionChange,
      isRenderErrorNVL,
      setIsRenderErrorNVL,
      errorNVLData,
      formatNumberWithSetting,
      extraMaterials = [],
      onExistingMaterialItemIdsChange,
      onRemoveExtraMaterial,
    },
    ref
  ) => {
  const showToast = useToast();

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [materialsWarehouses, setMaterialsWarehouses] = useState({});
  const [selectedMaterialRows, setSelectedMaterialRows] = useState([]);
  const [hasInitializedProductSelection, setHasInitializedProductSelection] = useState(false);
  const [hasInitializedMaterialSelection, setHasInitializedMaterialSelection] = useState(false);
  const [materialsSearchTerm, setMaterialsSearchTerm] = useState('');
  const [externalMaterials, setExternalMaterials] = useState([]);
  const [builtinMaterialsWithWarehouses, setBuiltinMaterialsWithWarehouses] = useState([]);
  const extraMaterialsCacheRef = useRef(new Map());
  const processedMaterialsRef = useRef(new Set()); // Theo dõi các nguyên liệu đã được xử lý tự động check

  const { data, isLoading } = useProductionOrderDetail({ id: poId, enabled: !!poId });

  // Helper functions
  const getProductId = useCallback(product => {
    return `${product.poi_id || product.item_id || ''}-${product.item_variation_option_value_id || ''}-${product.pp_id || ''}`;
  }, []);

  const getMaterialId = useCallback(material => {
    return `${material.item_id}-${material.item_variation_option_value_id || ''}-${material.pp_id || ''}`;
  }, []);

  const getExtraMaterialKey = useCallback(material => {
    if (!material) return '';
    const itemId = material.item_id || '';
    const variationId = material.item_variation_option_value_id ?? material.item_variation_id ?? material.variant_id ?? '';
    return `${itemId}-${variationId}`;
  }, []);

  // Computed values
  const flatProducts = useMemo(() => {
    if (!data?.listPOItems || !Array.isArray(data.listPOItems)) return [];
    const allProducts = data.listPOItems.flatMap(poItem => poItem.items_products || []);
    return allProducts.map((product, index) => ({
      ...product,
      __originalIndex: index,
    }));
  }, [data]);

  // Reset selection state when poId changes
  useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
    setHasInitializedProductSelection(false);
    setHasInitializedMaterialSelection(false);
    setSelectedMaterialRows([]);
    setMaterialsWarehouses({});
  }, [poId]);

  // Auto-select all products once data is available
  useEffect(() => {
    if (!hasInitializedProductSelection && flatProducts.length > 0) {
      const allProductIds = flatProducts.map(product => getProductId(product));
      setSelectedProducts(allProductIds);
      setSelectAll(true);
      setHasInitializedProductSelection(true);
    }
  }, [flatProducts, getProductId, hasInitializedProductSelection]);

  const products = useMemo(() => {
    if (flatProducts.length === 0) return [];
    const selectedSet = new Set(selectedProducts);
    const selectedList = [];
    const unselectedList = [];

    flatProducts.forEach(product => {
      if (selectedSet.has(getProductId(product))) {
        selectedList.push(product);
      } else {
        unselectedList.push(product);
      }
    });

    return [...selectedList, ...unselectedList];
  }, [flatProducts, selectedProducts, getProductId]);

  // Lấy poi_ids từ các products đã chọn
  const poiIds = useMemo(() => {
    if (selectedProducts.length === 0) return [];
    return products
      .filter(product => selectedProducts.includes(getProductId(product)))
      .map(product => product.poi_id)
      .filter(Boolean);
  }, [selectedProducts, products, getProductId]);

  // Gọi API để lấy materials
  const requestData = useMemo(() => {
    if (poiIds.length === 0 || !poId) return null;
    return {
      po_id: Number(poId),
      poi_ids: poiIds.map(id => Number(id)),
    };
  }, [poiIds, poId]);

  const { data: suggestData, isLoading: isLoadingMaterials } = useListSuggestPo(requestData);

  // Lấy kho hàng cho data.materials từ API
  useEffect(() => {
    let isMounted = true;
    const hydrateBuiltinMaterials = async () => {
      const materials = suggestData?.data?.materials || suggestData?.materials || [];
      if (!materials.length) {
        setBuiltinMaterialsWithWarehouses([]);
        return;
      }

      const enriched = await Promise.all(
        materials.map(async material => {
          if (material.warehouses?.length) {
            return material;
          }
          try {
            const formData = new FormData();
            formData.append('type_item', material.type_item ?? 'material');
            formData.append('type_origin', material.type_origin ?? 'material');
            const variationId = material.item_variation_option_value_id ?? material.item_variation_id ?? material.variant_id ?? '';
            formData.append('item_variation_option_value_id', variationId);
            formData.append('pp_id', material.pp_id ?? '');
            formData.append('po_id', poId ?? '');
            formData.append('is_semi', 1);
            const res = await apiProductionsOrders.apiGetWarehousesBOM(formData);
            const warehouses = res?.data?.warehouses || [];
            return {
              ...material,
              warehouses,
            };
          } catch (error) {
            return material;
          }
        })
      );

      if (isMounted) {
        setBuiltinMaterialsWithWarehouses(enriched);
      }
    };

    hydrateBuiltinMaterials();

    return () => {
      isMounted = false;
    };
  }, [suggestData, poId]);

  // Lấy kho hàng cho extraMaterials từ SelectSearch
  useEffect(() => {
    let isMounted = true;
    const hydrateMaterials = async () => {
      if (!extraMaterials?.length) {
        extraMaterialsCacheRef.current.clear();
        setExternalMaterials([]);
        return;
      }

      const allowedKeys = new Set(extraMaterials.map(getExtraMaterialKey));
      extraMaterialsCacheRef.current.forEach((_, key) => {
        if (!allowedKeys.has(key)) {
          extraMaterialsCacheRef.current.delete(key);
        }
      });

      const enriched = await Promise.all(
        extraMaterials.map(async material => {
          const cacheKey = getExtraMaterialKey(material);
          const cachedMaterial = extraMaterialsCacheRef.current.get(cacheKey);
          if (cachedMaterial && Array.isArray(cachedMaterial.warehouses) && cachedMaterial.warehouses.length > 0) {
            return cachedMaterial;
          }

          if (material.warehouses?.length > 0) {
            const normalized = {
              ...material,
              warehouses: Array.isArray(material.warehouses) ? material.warehouses : [],
            };
            extraMaterialsCacheRef.current.set(cacheKey, normalized);
            return normalized;
          }

          try {
            const formData = new FormData();
            formData.append('type_item', material.type_item ?? 'material');
            formData.append('type_origin', material.type_origin ?? 'material');
            formData.append('item_variation_option_value_id', material.item_variation_option_value_id ?? '');
            formData.append('pp_id', material.pp_id ?? '');
            formData.append('po_id', poId ?? '');
            const res = await apiProductionsOrders.apiGetWarehousesBOM(formData);
            const warehouses = res?.data?.warehouses || [];
            const normalized = {
              ...material,
              warehouses,
            };
            extraMaterialsCacheRef.current.set(cacheKey, normalized);
            return normalized;
          } catch (error) {
            extraMaterialsCacheRef.current.set(cacheKey, material);
            return material;
          }
        })
      );

      if (isMounted) {
        setExternalMaterials(enriched);
      }
    };

    hydrateMaterials();

    return () => {
      isMounted = false;
    };
  }, [extraMaterials, getExtraMaterialKey, poId]);

  useEffect(() => {
    extraMaterialsCacheRef.current.clear();
    processedMaterialsRef.current.clear(); // Reset khi poId thay đổi
  }, [poId]);

  // Tự động check nguyên liệu mới khi thêm từ SelectSearch
  useEffect(() => {
    if (!externalMaterials?.length) {
      // Nếu không có externalMaterials, xóa tất cả processed materials
      processedMaterialsRef.current.clear();
      return;
    }

    // Lấy danh sách materialId hiện tại
    const currentMaterialIds = new Set(externalMaterials.map(material => getMaterialId(material)));
    
    // Xóa các materialId không còn trong danh sách khỏi processedMaterialsRef
    processedMaterialsRef.current.forEach(materialId => {
      if (!currentMaterialIds.has(materialId)) {
        processedMaterialsRef.current.delete(materialId);
      }
    });

    // Xử lý các nguyên liệu mới
    externalMaterials.forEach(material => {
      const materialId = getMaterialId(material);
      
      // Bỏ qua nếu đã được xử lý trước đó
      if (processedMaterialsRef.current.has(materialId)) return;

      const warehouses = Array.isArray(material.warehouses) ? material.warehouses : [];
      
      // Đánh dấu đã xử lý
      processedMaterialsRef.current.add(materialId);

      // Tự động thêm vào danh sách đã chọn
      setSelectedMaterialRows(prev => (prev.includes(materialId) ? prev : [...prev, materialId]));

      // Tự động tạo lot row
      setMaterialsWarehouses(prev => {
        const currentState = prev[materialId] || { lotRows: [], isOpen: false };
        // Chỉ tạo lot row mới nếu chưa có
        if (currentState.lotRows.length === 0) {
          return {
            ...prev,
            [materialId]: {
              ...currentState,
              lotRows: [createLotRow(warehouses)],
              isOpen: true,
            },
          };
        }
        return prev;
      });
    });
  }, [externalMaterials, getMaterialId]);

  const allMaterials = useMemo(() => {
    const boms = suggestData?.data?.boms || suggestData?.boms || {};
    const bomEntries = Object.values(boms || {});

    const apiBomMaterials = bomEntries.map((material, index) => ({
      ...material,
      __originalIndex: index,
      __isExtra: false,
    }));

    const builtinExtraMaterials = (builtinMaterialsWithWarehouses.length > 0 ? builtinMaterialsWithWarehouses : (suggestData?.data?.materials || suggestData?.materials || [])).map((material, idx) => {
      const variationId = material.item_variation_option_value_id ?? material.item_variation_id ?? material.variant_id ?? '';
      return {
        ...material,
        item_variation_option_value_id: variationId,
        unit_name: material.unit_name ?? material.unit_name_primary,
        unit_name_primary: material.unit_name_primary ?? material.unit_name,
        warehouses: Array.isArray(material.warehouses) ? material.warehouses : [],
        __originalIndex: apiBomMaterials.length + idx,
        __isExtra: false,
      };
    });

    // Đặt __originalIndex của normalizedExternal nhỏ hơn để các nguyên liệu mới thêm lên đầu khi sắp xếp
    // Các nguyên liệu mới nhất (được thêm vào đầu extraMaterials, idx = 0) sẽ có __originalIndex nhỏ nhất
    const externalLength = externalMaterials?.length || 0;
    const normalizedExternal = (externalMaterials || []).map((material, idx) => ({
      ...material,
      __originalIndex: -externalLength + idx, // idx = 0 (mới nhất) -> -externalLength, idx tăng -> __originalIndex tăng
      __isExtra: true,
    }));

    // Đặt các nguyên liệu từ SelectSearch (mới thêm) lên đầu danh sách
    return [...normalizedExternal, ...apiBomMaterials, ...builtinExtraMaterials];
  }, [suggestData, externalMaterials, builtinMaterialsWithWarehouses]);

  const materialMap = useMemo(() => {
    const map = new Map();
    allMaterials.forEach(material => {
      map.set(getMaterialId(material), material);
    });
    return map;
  }, [allMaterials, getMaterialId]);

  // Tự động chọn tất cả nguyên liệu có kho khi dữ liệu được load lần đầu
  useEffect(() => {
    // Chỉ chạy một lần khi dữ liệu được load lần đầu
    if (hasInitializedMaterialSelection) return;
    
    // Đợi đến khi suggestData đã có và không còn loading
    if (isLoadingMaterials || !suggestData) return;
    
    // Đợi đến khi allMaterials đã có dữ liệu
    if (allMaterials.length === 0) return;
    
    // Kiểm tra xem có materials nào cần hydrate warehouses không
    // Nếu suggestData có materials nhưng builtinMaterialsWithWarehouses chưa có, có thể đang hydrate
    const suggestMaterials = suggestData?.data?.materials || suggestData?.materials || [];
    const needsHydration = suggestMaterials.some(material => 
      material.type_origin !== 'semi_products' && 
      (!material.warehouses || material.warehouses.length === 0)
    );
    
    // Nếu cần hydrate và builtinMaterialsWithWarehouses chưa được hydrate, đợi thêm
    if (needsHydration && builtinMaterialsWithWarehouses.length === 0 && suggestMaterials.length > 0) {
      return;
    }
    
    // Lọc các nguyên liệu có kho (loại trừ externalMaterials vì chúng đã được xử lý riêng)
    const materialsWithWarehouses = allMaterials.filter(material => {
      // Bỏ qua các nguyên liệu từ externalMaterials (đã được xử lý tự động ở useEffect khác)
      if (material.__isExtra) return false;
      
      const warehouses = Array.isArray(material.warehouses) ? material.warehouses : [];
      return warehouses.length > 0;
    });

    // Nếu không có materials nào có kho, đánh dấu đã initialize và return
    if (materialsWithWarehouses.length === 0) {
      setHasInitializedMaterialSelection(true);
      return;
    }

    // Tự động chọn tất cả nguyên liệu có kho
    const materialIdsWithWarehouses = materialsWithWarehouses.map(material => getMaterialId(material));
    setSelectedMaterialRows(prev => {
      // Chỉ thêm những materialId chưa có trong danh sách
      const newIds = materialIdsWithWarehouses.filter(id => !prev.includes(id));
      return prev.length === 0 ? materialIdsWithWarehouses : [...prev, ...newIds];
    });

    // Tự động tạo lot rows cho các nguyên liệu được chọn
    setMaterialsWarehouses(prev => {
      const newState = { ...prev };
      materialsWithWarehouses.forEach(material => {
        const materialId = getMaterialId(material);
        const warehouses = Array.isArray(material.warehouses) ? material.warehouses : [];
        
        // Chỉ tạo lot row nếu chưa có
        if (!newState[materialId] || newState[materialId].lotRows.length === 0) {
          newState[materialId] = {
            lotRows: [createLotRow(warehouses)],
            isOpen: true,
          };
        }
      });
      return newState;
    });

    setHasInitializedMaterialSelection(true);
  }, [allMaterials, hasInitializedMaterialSelection, getMaterialId, suggestData, isLoadingMaterials, builtinMaterialsWithWarehouses]);

  // Gửi keys item+variant để kiểm tra duplicate trong SelectSearch
  // Lấy từ materials trong boms và data.materials (materials đã có trong danh sách)
  useEffect(() => {
    if (typeof onExistingMaterialItemIdsChange !== 'function') return;
    const itemIdKeys = new Set();
    
    // Lấy từ boms (materials từ BOM gốc)
    const boms = suggestData?.data?.boms || suggestData?.boms || {};
    const bomEntries = Object.values(boms || {});
    bomEntries.forEach(material => {
      const key = getExtraMaterialKey(material) || String(material.item_id || '');
      if (key) {
        itemIdKeys.add(key);
      }
    });
    
    // Lấy từ data.materials (materials bổ sung từ API)
    const materials = suggestData?.data?.materials || suggestData?.materials || [];
    materials.forEach(material => {
      const key = getExtraMaterialKey(material) || String(material.item_id || '');
      if (key) {
        itemIdKeys.add(key);
      }
    });
    
    onExistingMaterialItemIdsChange(itemIdKeys);
  }, [suggestData, onExistingMaterialItemIdsChange]);

  const filteredMaterials = useMemo(() => {
    if (!materialsSearchTerm.trim()) return allMaterials;
    const normalizedSearch = normalizeString(materialsSearchTerm);
    return allMaterials.filter(material => normalizeString(material.item_name).includes(normalizedSearch));
  }, [allMaterials, materialsSearchTerm]);

  // Sắp xếp materials: đã chọn lên đầu, bỏ chọn về vị trí cũ
  const materials = useMemo(() => {
    if (filteredMaterials.length === 0) return [];

    const selectedList = filteredMaterials.filter(material => selectedMaterialRows.includes(getMaterialId(material))).sort((a, b) => a.__originalIndex - b.__originalIndex);

    const unselectedList = filteredMaterials.filter(material => !selectedMaterialRows.includes(getMaterialId(material))).sort((a, b) => a.__originalIndex - b.__originalIndex);

    return [...selectedList, ...unselectedList];
  }, [filteredMaterials, selectedMaterialRows, getMaterialId]);

  // Handlers
  const handleSelectProduct = useCallback(
    (productId, checked) => {
      if (!checked) {
        // Kiểm tra nếu đang cố bỏ chọn và chỉ còn 1 phần tử được chọn
        const currentSelected = selectedProducts.filter(id => id !== productId);
        if (currentSelected.length === 0) {
          showToast('error', 'Phải chọn ít nhất một thành phẩm!');
          return;
        }
      }
      setHasInitializedProductSelection(true);
      setSelectedProducts(prev => (checked ? [...prev, productId] : prev.filter(id => id !== productId)));
    },
    [selectedProducts, showToast]
  );

  const handleSelectAll = useCallback(
    checked => {
      if (!checked) {
        // Không cho phép bỏ chọn tất cả
        showToast('error', 'Phải chọn ít nhất một thành phẩm!');
        return;
      }
      setHasInitializedProductSelection(true);
      setSelectAll(checked);
      setSelectedProducts(checked ? products.map(p => getProductId(p)) : []);
    },
    [products, getProductId, showToast]
  );

  // Đồng bộ trạng thái checkbox "chọn tất cả" khi người dùng chọn từng sản phẩm
  useEffect(() => {
    if (!products.length) {
      if (selectAll) {
        setSelectAll(false);
      }
      return;
    }

    const isAllSelected = products.every(product => selectedProducts.includes(getProductId(product)));
    if (isAllSelected && !selectAll) {
      setSelectAll(true);
    } else if (!isAllSelected && selectAll) {
      setSelectAll(false);
    }
  }, [products, selectedProducts, getProductId, selectAll]);

  const handleAddLotRow = useCallback(
    material => {
      const materialId = getMaterialId(material);
      const currentState = materialsWarehouses[materialId] || { lotRows: [], isOpen: false };
      const warehouses = Array.isArray(material.warehouses) ? material.warehouses : [];

      if (warehouses.length === 0) {
        showToast('error', `Sản phẩm "${material.item_name}" không có kho hàng. Vui lòng bổ sung kho hàng trước khi chọn!`);
        return;
      }

      setMaterialsWarehouses(prev => ({
        ...prev,
        [materialId]: {
          ...currentState,
          lotRows: [createLotRow(warehouses), ...currentState.lotRows],
          isOpen: true,
        },
      }));
      setSelectedMaterialRows(prev => (prev.includes(materialId) ? prev : [...prev, materialId]));
    },
    [materialsWarehouses, getMaterialId]
  );

  const handleToggleMaterial = useCallback(
    (material, checked) => {
      const materialId = getMaterialId(material);
      if (checked && (!Array.isArray(material.warehouses) || material.warehouses.length === 0)) {
        showToast('error', `Sản phẩm "${material.item_name}" không có kho hàng. Vui lòng bổ sung kho hàng trước khi chọn!`);
        return;
      }

      if (checked) {
        // Tự động thêm kho xuất khi chọn nguyên liệu
        const currentState = materialsWarehouses[materialId] || { lotRows: [], isOpen: false };
        const warehouses = Array.isArray(material.warehouses) ? material.warehouses : [];

        // Chỉ tạo lot row mới nếu chưa có lot rows nào
        if (currentState.lotRows.length === 0 && warehouses.length > 0) {
          setMaterialsWarehouses(prev => ({
            ...prev,
            [materialId]: {
              ...currentState,
              lotRows: [createLotRow(warehouses)],
              isOpen: true,
            },
          }));
        } else if (currentState.lotRows.length === 0) {
          // Nếu không có warehouses, vẫn tạo lot row rỗng để người dùng có thể thêm kho sau
          setMaterialsWarehouses(prev => ({
            ...prev,
            [materialId]: {
              ...currentState,
              lotRows: [createLotRow([])],
              isOpen: true,
            },
          }));
        } else {
          // Nếu đã có lot rows, chỉ đảm bảo isOpen = true
          setMaterialsWarehouses(prev => ({
            ...prev,
            [materialId]: {
              ...prev[materialId],
              isOpen: true,
            },
          }));
        }

        // Thêm vào danh sách đã chọn
        setSelectedMaterialRows(prev => (prev.includes(materialId) ? prev : [...prev, materialId]));
      } else {
        // Bỏ chọn nguyên liệu - xóa luôn các lot rows đã tạo
        setSelectedMaterialRows(prev => prev.filter(id => id !== materialId));
        setMaterialsWarehouses(prev => {
          const newState = { ...prev };
          delete newState[materialId];
          return newState;
        });
      }
    },
    [getMaterialId, showToast, materialsWarehouses]
  );

  // Lọc materials có kho
  const materialsWithWarehouses = useMemo(() => {
    return materials.filter(material => {
      const warehouses = Array.isArray(material.warehouses) ? material.warehouses : [];
      return warehouses.length > 0;
    });
  }, [materials]);

  const handleToggleAllMaterials = useCallback(
    checked => {
      if (checked) {
        // Kiểm tra nếu không có nguyên liệu nào có kho
        if (materialsWithWarehouses.length === 0) {
          showToast('error', 'Không có nguyên liệu nào có kho hàng để chọn!');
          return;
        }
        
        // Chỉ chọn những nguyên liệu có kho
        const materialIdsWithWarehouses = materialsWithWarehouses.map(material => getMaterialId(material));
        setSelectedMaterialRows(materialIdsWithWarehouses);
        
        // Tự động mở và tạo lot rows cho tất cả nguyên liệu được chọn
        setMaterialsWarehouses(prev => {
          const newState = { ...prev };
          materialsWithWarehouses.forEach(material => {
            const materialId = getMaterialId(material);
            const warehouses = Array.isArray(material.warehouses) ? material.warehouses : [];
            const currentState = newState[materialId] || { lotRows: [], isOpen: false };
            
            // Tạo lot row nếu chưa có
            if (currentState.lotRows.length === 0 && warehouses.length > 0) {
              newState[materialId] = {
                lotRows: [createLotRow(warehouses)],
                isOpen: true,
              };
            } else if (currentState.lotRows.length === 0) {
              // Nếu không có warehouses, vẫn tạo lot row rỗng
              newState[materialId] = {
                lotRows: [createLotRow([])],
                isOpen: true,
              };
            } else {
              // Nếu đã có lot rows, chỉ đảm bảo isOpen = true
              newState[materialId] = {
                ...currentState,
                isOpen: true,
              };
            }
          });
          return newState;
        });
      } else {
        // Bỏ chọn tất cả - đóng tất cả phần chọn kho
        setSelectedMaterialRows([]);
        setMaterialsWarehouses(prev => {
          const newState = { ...prev };
          Object.keys(newState).forEach(materialId => {
            if (newState[materialId]) {
              newState[materialId] = {
                ...newState[materialId],
                isOpen: false,
              };
            }
          });
          return newState;
        });
      }
    },
    [materialsWithWarehouses, getMaterialId, showToast]
  );

  // Cleanup selected materials khi danh sách thay đổi
  useEffect(() => {
    setSelectedMaterialRows(prev => {
      const filtered = prev.filter(id => allMaterials.some(material => getMaterialId(material) === id));
      if (filtered.length === prev.length && filtered.every((id, index) => id === prev[index])) {
        return prev;
      }
      return filtered;
    });
  }, [allMaterials, getMaterialId]);

  // Đồng bộ trạng thái mở/đóng với trạng thái check/uncheck
  useEffect(() => {
    setMaterialsWarehouses(prev => {
      const newState = { ...prev };
      let hasChanges = false;

      // Duyệt qua tất cả materials trong state
      Object.keys(newState).forEach(materialId => {
        const isSelected = selectedMaterialRows.includes(materialId);
        const currentState = newState[materialId];

        if (currentState) {
          // Nếu được check nhưng đang đóng -> mở
          if (isSelected && !currentState.isOpen) {
            newState[materialId] = {
              ...currentState,
              isOpen: true,
            };
            hasChanges = true;
          }
          // Nếu không được check nhưng đang mở -> đóng
          else if (!isSelected && currentState.isOpen) {
            newState[materialId] = {
              ...currentState,
              isOpen: false,
            };
            hasChanges = true;
          }
        }
      });

      // Chỉ return state mới nếu có thay đổi
      return hasChanges ? newState : prev;
    });
  }, [selectedMaterialRows]);

  // Helper để update materialsWarehouses
  const updateMaterialWarehouse = useCallback((materialId, updater) => {
    setMaterialsWarehouses(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        ...(typeof updater === 'function' ? updater(prev[materialId]) : updater),
      },
    }));
  }, []);

  const buildSubmitPayload = useCallback(() => {
    if (!poId) {
      showToast('error', 'Không tìm thấy thông tin PO.');
      return null;
    }

    if (selectedMaterialRows.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một nguyên liệu để xuất thêm.');
      return null;
    }

    // Lấy boms gốc từ suggestData
    const originalBoms = suggestData?.data?.boms || suggestData?.boms || {};
    const bomsPayload = {};
    const extraMaterialsPayload = [];

    for (const materialId of selectedMaterialRows) {
      const material = materialMap.get(materialId);
      if (!material) continue;

      // Tìm key gốc trong boms (ví dụ: "material__974")
      const originalKey = Object.keys(originalBoms).find(key => {
        const bom = originalBoms[key];
        return getMaterialId(bom) === materialId;
      });

      const warehouseState = materialsWarehouses[materialId];
      if (!warehouseState || !Array.isArray(warehouseState.lotRows) || warehouseState.lotRows.length === 0) {
        showToast('error', `Vui lòng thêm kho cho nguyên liệu ${material.item_name}.`);
        return null;
      }

      // Lọc và chuẩn bị warehouses với quantity_enter
      const preparedWarehouses = warehouseState.lotRows
        .filter(row => row.id_warehouse_custom && Number(row.quantity_enter) > 0)
        .map(row => {
          // Tìm warehouse gốc để lấy đầy đủ thông tin
          // Tìm trong material.warehouses hoặc list_warehouses của row
          const originalWarehouse =
            (material.warehouses || []).find(w => w.id_warehouse_custom === row.id_warehouse_custom) ||
            (row.list_warehouses || []).find(w => w.id_warehouse_custom === row.id_warehouse_custom) ||
            {};
          return {
            ...originalWarehouse,
            type_items: originalWarehouse.type_items || material.type_item,
            item_variation_id: originalWarehouse.item_variation_id || material.item_variation_option_value_id,
            // Ưu tiên lấy từ row, sau đó từ originalWarehouse
            warehouse_id: row.warehouse_id || originalWarehouse.warehouse_id || '',
            location_id: row.location_id || originalWarehouse.location_id || '',
            serial: originalWarehouse.serial ?? null,
            expiration_date: row.expiration_date || originalWarehouse.expiration_date || '',
            lot: row.lot || originalWarehouse.lot || '',
            pois_id: originalWarehouse.pois_id || '0',
            name_location: row.name_location || originalWarehouse.name_location || '',
            name_warehouse: row.name_warehouse || originalWarehouse.name_warehouse || '',
            total_quantity: originalWarehouse.total_quantity ?? 0,
            quantity_warehouse: originalWarehouse.quantity_warehouse || '0',
            id_warehouse_custom: row.id_warehouse_custom,
            unit_id_primary: row.unit_id_primary ?? 0,
            quantity_enter: Number(row.quantity_enter || 0),
          };
        });

      if (preparedWarehouses.length === 0) {
        showToast('error', `Vui lòng chọn kho và số lượng xuất thêm cho ${material.item_name}.`);
        return null;
      }

      const baseBom =
        originalKey && originalBoms[originalKey]
          ? originalBoms[originalKey]
          : {
              type_origin: material.type_origin ?? 'material',
              type_item: material.type_item ?? 'material',
              item_id: material.item_id,
              item_variation_option_value_id: material.item_variation_option_value_id,
              item_code: material.item_code,
              item_name: material.item_name,
              product_variation: material.product_variation,
              quantity_total_quota: material.quantity_total_quota ?? material.quantity_quota_primary ?? 0,
              quantity_quota_primary: material.quantity_quota_primary ?? material.quantity_total_quota ?? 0,
              quota_exchange: material.quota_exchange ?? 1,
              images: material.images ?? '',
              unit_id_primary: material.unit_id_primary ?? 0,
              unit_name_primary: material.unit_name_primary ?? material.unit_name,
              unit_name: material.unit_name ?? material.unit_name_primary,
              ppi_id: material.pp_id ?? 0,
              pp_id: material.pp_id ?? 0,
            };

      if (originalKey) {
      bomsPayload[originalKey] = {
          ...baseBom,
        warehouses: preparedWarehouses,
      };
      } else {
        extraMaterialsPayload.push({
          ...baseBom,
          warehouses: preparedWarehouses,
        });
      }
    }

    if (Object.keys(bomsPayload).length === 0 && extraMaterialsPayload.length === 0) {
      showToast('error', 'Không có dữ liệu hợp lệ để xuất thêm.');
      return null;
    }

    const payload = {
      po_id: Number(poId),
      poi_ids: poiIds.map(id => Number(id)),
      boms: bomsPayload,
    };

    if (extraMaterialsPayload.length > 0) {
      payload.materials = extraMaterialsPayload;
    }

    return payload;
  }, [poId, poiIds, selectedMaterialRows, materialMap, materialsWarehouses, suggestData, getMaterialId, showToast]);

  const resetSelections = useCallback(() => {
    setSelectedMaterialRows([]);
    setMaterialsWarehouses({});
  }, []);

  useEffect(() => {
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(selectedMaterialRows.length);
    }
  }, [selectedMaterialRows, onSelectionChange]);

  useImperativeHandle(
    ref,
    () => ({
      buildSubmitPayload,
      resetSelections,
    }),
    [buildSubmitPayload, resetSelections]
  );

  const dataSeting = useSetingServer();

  return (
    <div className='flex-1 min-h-[60vh] max-h-[80vh] w-full flex flex-col gap-4 h-full'>
      <div className='flex-1 flex gap-4 overflow-hidden'>
        {/* Left Sidebar - Product List */}
        <ProductSelectionSidebar
          products={products}
          selectedProducts={selectedProducts}
          selectAll={selectAll}
          onSelectAll={handleSelectAll}
          onSelectProduct={handleSelectProduct}
          getProductId={getProductId}
          isLoading={isLoading}
        />

        {/* Right Content - Materials Detail */}
        <div className='flex-1 flex flex-col rounded-t-xl bg-white overflow-hidden'>
          <div className='flex justify-between items-center gap-10 p-2 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
            <h3 className='text-sm font-semibold text-[#141522] whitespace-nowrap'>Chọn nguyên liệu cần xuất bổ sung</h3>
            <div className='bg-white flex gap-x-2 items-center w-1/2 rounded-lg border border-[#D0D5DD] px-2 py-1.5 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
              <input
                type='text'
                placeholder='Tìm kiếm theo tên nguyên vật liệu'
                className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-300 text-xs'
                value={materialsSearchTerm}
                onChange={e => setMaterialsSearchTerm(e.target.value)}
              />
              {materialsSearchTerm && (
                  <button
                    type='button'
                    onClick={() => setMaterialsSearchTerm('')}
                    className='rounded-full bg-gray-100 hover:bg-gray-200 text-[#3A3E4C] p-1 transition'
                    aria-label='Xóa tìm kiếm'
                  >
                    <CloseXIcon className='size-3' />
                  </button>
              )}
              <button className='rounded-lg bg-[#0375F3] p-1'>
                <MagnifyingGlassIcon className='size-3 text-white' />
              </button>
            </div>
          </div>

          <ErrorNVLBanner
            isVisible={isRenderErrorNVL}
            errorData={errorNVLData}
            onClose={() => setIsRenderErrorNVL(false)}
            formatNumberWithSetting={formatNumberWithSetting || formatNumber}
            className='m-2'
          />

          {selectedProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
              <div className='flex flex-col items-center justify-center h-full'>
                <Image src={IMAGES.emptyProductOrder} alt='Không có dữ liệu' width={200} height={200} className='object-cover rounded-md' />
                <div className='flex items-center gap-2 mt-2'>
                  <PlusIcon className='size-4' />
                  <p className='responsive-text-xl font-medium text-neutral-05'>Chọn thành phẩm</p>
                </div>
                <p className='responsive-text-lg text-neutral-03 mt-2'>Chưa chọn thành phẩm. Vui lòng chọn thành phẩm.</p>
              </div>
            </div>
          ) : materials.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
              <NoData type='report' titleText='Không có nguyên liệu nào cho thành phẩm đã chọn' />
            </div>
          ) : (
            <div className='overflow-hidden flex-1'>
              <table className='min-w-full border-separate border-spacing-0 table-fixed border-b border-[#E5E7EB]'>
                <thead className='sticky top-0 z-10 responsive-text-base font-normal'>
                  <tr>
                    <th className='pt-3 pb-1 px-4 text-center text-[#667085] w-[62px]'>
                      <CheckboxDefault checked={materialsWithWarehouses.length > 0 && selectedMaterialRows.length === materialsWithWarehouses.length && materialsWithWarehouses.every(material => selectedMaterialRows.includes(getMaterialId(material)))} onChange={handleToggleAllMaterials} className='!space-x-0' />
                    </th>
                    <th className='font-normal pt-3 pb-1 pr-4 text-left text-[#667085]'>Nguyên vật liệu</th>
                    <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[200px]'>Số lượng cần xuất</th>
                    <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[200px]'>Số lượng đã xuất</th>
                    <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[100px]'>Thao tác</th>
                  </tr>
                </thead>
              </table>
              <Customscrollbar className='max-h-[50vh] 2xl:max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                <table className='min-w-full table-fixed border-separate border-spacing-0'>
                  <tbody>
                    {materials.map(material => {
                      console.log(materials)
                      const materialId = getMaterialId(material);
                      const quantityTotal = Number(material.quantity_total_quota || 0);
                      const quantityQuotaPrimary = Number(material.quantity_quota_primary || 0);
                      const quantitySuggestExporting = Number(material.quantity_suggest_exporting || 0);
                      const materialWarehouseState = materialsWarehouses[materialId] || { lotRows: [], isOpen: false };
                      const hasWarehouses = Array.isArray(material.warehouses) && material.warehouses.length > 0;
                      const isSelected = selectedMaterialRows.includes(materialId);
                      const isExtraMaterial = Boolean(material.__isExtra);
                      return (
                        <>
                          <tr
                            key={materialId}
                            className='hover:bg-gradient-to-r hover:from-[#F9FAFB] hover:to-[#F3F4F6] transition-all duration-200 group cursor-pointer'
                            onClick={() => handleToggleMaterial(material, !isSelected)}
                          >
                            <td className='py-4 px-4 text-center text-sm font-semibold text-[#667085] w-[62px]'>
                              <div onClick={e => e.stopPropagation()}>
                                <CheckboxDefault checked={isSelected} onChange={checked => handleToggleMaterial(material, checked)} className='!space-x-0' />
                              </div>
                            </td>
                            <td className='py-4 pr-4 text-left'>
                              <div className='flex flex-col'>
                                <h3 className='text-sm font-semibold text-[#141522]'>{material.item_name}</h3>
                                <div className='flex flex-col gap-0.5'>
                                  <p className='text-[10px] font-normal text-[#667085]'>{material.product_variation}</p>
                                  <p className='text-xs font-normal text-typo-blue-2'>{material.item_code}</p>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-center w-[200px]'>
                              <div className='flex gap-5 justify-center items-center'>
                                {/* {material.unit_name !== material.unit_name_primary && ( */}
                                  {/* <> */}
                                    <div className='text-start whitespace-nowrap'>
                                      <p className='text-blue-fmrp font-medium text-lg'>
                                        {formatNumber(quantityTotal)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                      </p>
                                      <span className='text-[#141522] text-xs font-medium'>{material.unit_name}</span>
                                    </div>
                                    <span className='text-[#141522] text-base font-medium'>
                                      <ApproximateEqualsIcon className='size-4' />
                                    </span>
                                  {/* </> */}
                                {/* )} */}
                                <div className='text-start whitespace-nowrap'>
                                  <p className='text-blue-fmrp font-medium text-lg'>
                                    {formatNumber(quantityQuotaPrimary)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                  </p>
                                  <span className='text-[#141522] text-xs font-medium'>{material.unit_name_primary}</span>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-center w-[200px] min-w-[200px] shrink-0'>
                              <div className='flex flex-col items-center gap-1'>
                                <p className='text-base font-semibold text-[#1FC583]'>
                                  {formatNumber(quantitySuggestExporting)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                </p>
                                <span className='text-xs font-normal text-[#667085]'>{material.unit_name_primary || material.unit_name}</span>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-center w-[100px] shrink-0'>
                              <div className='flex justify-center gap-2'>
                                <Tooltip title='Bổ sung kho xuất nguyên liệu' position='top' arrow={true}>
                                  <div
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleAddLotRow(material);
                                    }}
                                    className='flex-shrink-0 min-h-[35px] min-w-[35px] cursor-pointer flex justify-center items-center flex-row rounded-full bg-[#EBF5FF] border border-transparent hover:border-[#1760B9] hover:bg-[#D0E8FF] hover:scale-110 transition-all duration-200 ease-out'
                                  >
                                    <FiPlus className='text-[#003DA0] group-hover:text-[#1760B9] transition-colors' size={19} />
                                  </div>
                                </Tooltip>
                                {isExtraMaterial && (
                                  <Tooltip title='Xoá nguyên liệu bổ sung' position='top' arrow={true}>
                                    <div
                                      onClick={e => {
                                        e.stopPropagation();
                                        // Xóa khỏi danh sách extraMaterials (ở parent)
                                        if (typeof onRemoveExtraMaterial === 'function') {
                                          const extraKey = getExtraMaterialKey(material);
                                          onRemoveExtraMaterial(extraKey);
                                        }

                                        // Đồng thời xóa toàn bộ state local liên quan đến nguyên liệu này
                                        const materialKey = getMaterialId(material);

                                        // 1. Bỏ chọn nguyên liệu trong danh sách đã chọn
                                        setSelectedMaterialRows(prev => prev.filter(id => id !== materialKey));

                                        // 2. Xóa toàn bộ cấu hình kho (lotRows, isOpen, ...) đã nhập cho nguyên liệu này
                                        setMaterialsWarehouses(prev => {
                                          const next = { ...prev };
                                          delete next[materialKey];
                                          return next;
                                        });

                                        // 3. Xóa cache kho cho nguyên liệu này để lần thêm lại không dùng kho cũ
                                        const extraKey = getExtraMaterialKey(material);
                                        if (extraKey) {
                                          extraMaterialsCacheRef.current.delete(extraKey);
                                        }
                                      }}
                                      className='flex-shrink-0 min-h-[35px] min-w-[35px] cursor-pointer flex justify-center items-center flex-row rounded-full bg-[#FFEFEF] border border-transparent hover:border-[#F87171] hover:bg-[#FEE2E2] hover:scale-110 transition-all duration-200 ease-out'
                                    >
                                      <CloseXIcon className='size-4 text-[#DC2626]' />
                                    </div>
                                  </Tooltip>
                                )}
                              </div>
                            </td>
                          </tr>

                          {materialWarehouseState.lotRows.length > 0 ? (
                            materialWarehouseState.lotRows.map((lot, index) => (
                              <WarehouseLotRow
                                key={lot.id || `lot-row-${index}`}
                                id={lot.id}
                                lot={lot.lot}
                                date={lot.expiration_date}
                                warehouse={lot.id_warehouse_custom}
                                isOpen={materialWarehouseState.isOpen}
                                setLotRows={updater => {
                                  updateMaterialWarehouse(materialId, prev => ({
                                    lotRows: typeof updater === 'function' ? updater(prev.lotRows || []) : updater,
                                  }));
                                }}
                                listWarehouses={lot.list_warehouses || material.warehouses || []}
                                total_quantity={Number(lot.total_quantity)}
                                lotRows={materialWarehouseState.lotRows}
                                onQuantityChange={() => {}}
                                formatNumber={formatNumber}
                                variant='reexport'
                                unitName={material.unit_name_primary || material.unit_name}
                              />
                            ))
                          ) : !hasWarehouses ? (
                            <tr>
                              <td colSpan={5} className='!bg-gradient-to-r from-[#EBF5FF] via-[#E8F4FF] to-[#EBF5FF]'>
                                <div className='py-2 text-xs font-normal text-[#991B1B] flex items-center justify-center gap-2'>
                                  <IoIosAlert className='text-[#991B1B] flex-shrink-0' size={17} />
                                  Vui lòng nhập thêm nguyên vật liệu để tiến hành xuất kho
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </Customscrollbar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default memo(PopupExportMaterialsTabReexport);
