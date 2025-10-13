<template>
  <div 
    ref="pullToRefreshContainer"
    class="card relative"
    @touchstart="onPullStart"
    @touchmove="onPullMove"
    @touchend="onPullEnd"
  >
    <!-- Pull-to-refresh indicator (solo móvil) -->
    <div 
      v-if="isMobile && (isPulling || isRefreshing)"
      class="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-white/90 backdrop-blur-sm z-10 transition-all duration-200"
      :style="{ 
        transform: `translateY(${Math.max(0, pullDistance - 20)}px)`,
        opacity: Math.min(1, pullDistance / 40)
      }"
    >
      <div class="flex items-center gap-2 text-gray-600">
        <svg 
          v-if="!isRefreshing"
          class="w-5 h-5 transition-transform duration-200"
          :style="{ transform: `rotate(${Math.min(180, pullDistance * 2)}deg)` }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <svg 
          v-else
          class="w-5 h-5 animate-spin" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="text-sm font-medium">
          {{ isRefreshing ? 'Actualizando...' : pullDistance >= pullThreshold ? 'Suelta para actualizar' : 'Desliza para actualizar' }}
        </span>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
      <h2 class="text-base sm:text-lg font-semibold text-gray-900">
        Gastos del Mes Actual
      </h2>
      <div class="text-xs sm:text-sm text-gray-500">
        {{ format(new Date(), 'MMMM yyyy', { locale: es }) }}
      </div>
    </div>

    <!-- Filtros -->
    <div id="filters-section" class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      <!-- Fila 1: Búsqueda mejorada con sugerencias -->
      <div class="grid grid-cols-1 gap-3 sm:gap-4">
        <div class="flex flex-col">
          <label for="search-input" class="block text-sm font-medium text-gray-700 mb-2">Buscar gastos</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </span>
            <input
              id="search-input"
              ref="searchInputRef"
              v-model="searchInput"
              type="text"
              class="input-field h-10 pl-9 pr-8 transition-all duration-200 focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 hover:border-gray-400"
              placeholder="Buscar por descripción, categoría o palabra clave"
              @keydown.enter.prevent="applySearchNow"
              @input="onSearchInput"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
              autocomplete="off"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
              @click="clearSearch"
              title="Limpiar búsqueda"
            >
              <svg class="h-4 w-4 transition-transform duration-200 hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Panel de sugerencias -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div 
              v-if="showSuggestions && searchSuggestions.length > 0" 
              class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              <!-- Sugerencias de búsqueda -->
              <div v-if="searchSuggestions.length > 0" class="p-2">
                <div class="text-xs font-medium text-gray-500 mb-2 px-2">Sugerencias</div>
                <button
                  v-for="suggestion in searchSuggestions"
                  :key="suggestion"
                  @click="selectSuggestion(suggestion)"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-md transition-colors duration-150"
                >
                  <svg class="inline w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  {{ suggestion }}
                </button>
              </div>

              <!-- Filtros rápidos (solo visual, sin funcionalidad) -->
              <div class="p-2 border-t border-gray-100">
                <div class="text-xs font-medium text-gray-500 mb-2 px-2">Filtros rápidos</div>
                <div class="flex flex-wrap gap-2">
                  <button
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 bg-gray-100 text-gray-700"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Este mes
                  </button>
                  <button
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 bg-gray-100 text-gray-700"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Última semana
                  </button>
                  <button
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 bg-gray-100 text-gray-700"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Gastos fijos
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Acordeón de filtros (solo mobile) -->
      <div class="sm:hidden">
        <button
          @click="filtersExpanded = !filtersExpanded"
          class="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          :class="{ 'border-primary-300 bg-primary-50': hasActiveFilters }"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">Filtros avanzados</span>
            <span v-if="hasActiveFilters" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {{ activeChips.length }}
            </span>
          </div>
          <svg 
            class="w-5 h-5 text-gray-500 transition-transform duration-200"
            :class="{ 'rotate-180': filtersExpanded }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="filtersExpanded" class="mt-3 space-y-3">
            <!-- Filtros dentro del acordeón (mobile) - IDs únicos para mobile -->
            <div class="space-y-3">
              <!-- Categoría y Tipo -->
              <div class="grid grid-cols-1 gap-3">
                <div class="flex flex-col">
                  <label for="category-filter-mobile" class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <AppSelect
                    id="category-filter-mobile"
                    v-model="selectedCategoryId"
                    :options="categoryFilterOptions"
                    placeholder="Todas las categorías"
                    data-category-select
                    class="h-10"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="type-filter-mobile" class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <AppSelect
                    id="type-filter-mobile"
                    v-model="selectedEntryType"
                    :options="typeOptions"
                    placeholder="Todos"
                    class="h-10"
                  />
                </div>
              </div>

              <!-- Estado (cuando aplique) -->
              <div v-if="selectedEntryType === 'payment'" class="flex flex-col">
                <label for="status-filter-mobile" class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <AppSelect
                  id="status-filter-mobile"
                  v-model="selectedStatus"
                  :options="statusFilterOptions"
                  placeholder="Todos los estados"
                  class="h-10"
                />
              </div>
              
              <!-- Periodo, Orden y Rango -->
              <div class="space-y-3">
                <div class="flex flex-col">
                  <label for="period-filter-mobile" class="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
                  <AppSelect
                    id="period-filter-mobile"
                    v-model="period"
                    :options="periodOptions"
                    placeholder="Mes actual"
                    class="h-10"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="sort-filter-mobile" class="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <AppSelect
                    id="sort-filter-mobile"
                    v-model="sortOrder"
                    :options="sortOptions"
                    placeholder="Más recientes primero"
                    class="h-10"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="range-button-mobile" class="block text-sm font-medium text-gray-700 mb-2">Rango personalizado</label>
                  <button
                    id="range-button-mobile"
                    :ref="el => { if (el) rangeBtnRefMobile = el }"
                    type="button"
                    class="input-field flex items-center justify-between h-10"
                    @click="toggleRange"
                  >
                    <span class="truncate text-left">{{ rangeLabel }}</span>
                    <svg class="h-4 w-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Filtros normales (solo desktop) - IDs únicos para desktop -->
      <div class="hidden sm:block space-y-3 sm:space-y-4">
        <!-- Fila 2: Categoría y Tipo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div class="flex flex-col">
            <label for="category-filter-desktop" class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <AppSelect
              id="category-filter-desktop"
              v-model="selectedCategoryId"
              :options="categoryFilterOptions"
              placeholder="Todas las categorías"
              data-category-select
              class="h-10"
            />
          </div>
          <div class="flex flex-col">
            <label for="type-filter-desktop" class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <AppSelect
              id="type-filter-desktop"
              v-model="selectedEntryType"
              :options="typeOptions"
              placeholder="Todos"
              class="h-10"
            />
          </div>
        </div>

        <!-- Fila 3: Estado (cuando aplique) -->
        <div v-if="selectedEntryType === 'payment'" class="grid grid-cols-1 gap-3 sm:gap-4">
          <div class="flex flex-col">
            <label for="status-filter-desktop" class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <AppSelect
              id="status-filter-desktop"
              v-model="selectedStatus"
              :options="statusFilterOptions"
              placeholder="Todos los estados"
              class="h-10"
            />
          </div>
        </div>
        
        <!-- Fila 4: Periodo, Orden y Rango de fechas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div class="flex flex-col">
            <label for="period-filter-desktop" class="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
            <AppSelect
              id="period-filter-desktop"
              v-model="period"
              :options="periodOptions"
              placeholder="Mes actual"
              class="h-10"
            />
          </div>
          <div class="flex flex-col">
            <label for="sort-filter-desktop" class="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
            <AppSelect
              id="sort-filter-desktop"
              v-model="sortOrder"
              :options="sortOptions"
              placeholder="Más recientes primero"
              class="h-10"
            />
          </div>
          <div class="flex flex-col">
            <label for="range-button-desktop" class="block text-sm font-medium text-gray-700 mb-2">Rango personalizado</label>
            <button
              id="range-button-desktop"
              :ref="el => { if (el) rangeBtnRef = el }"
              type="button"
              class="input-field flex items-center justify-between h-10"
              @click="toggleRange"
            >
              <span class="truncate text-left">{{ rangeLabel }}</span>
              <svg class="h-4 w-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente de calendario de rango -->
    <DateRangePicker
      v-model="showRange"
      :picker-style="rangePickerStyle"
      :year="rangeYear"
      :month-name="rangeMonthName"
      :calendar-days="rangeCalendarDays"
      @apply-preset="applyPreset"
      @prev-month="rangePrevMonth"
      @next-month="rangeNextMonth"
      @pick-date="onPickWithAuto"
      @clear="clearRange"
      @apply="applyRange"
    />

    <div v-if="loading" class="space-y-4">
      <!-- Skeleton para el header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <div class="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
    </div>

      <!-- Skeleton para filtros -->
      <div class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <!-- Skeleton para cards de gastos -->
      <div class="space-y-3">
        <div v-for="i in 6" :key="i" class="p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 animate-pulse">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div class="flex-1 min-w-0">
                  <div class="h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                  <div class="h-3 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="h-4 w-16 bg-gray-200 rounded mb-2"></div>
              <div class="flex justify-end gap-2">
                <div class="h-8 w-8 bg-gray-200 rounded"></div>
                <div class="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentMonthExpenses.length === 0" class="text-center py-12 px-4">
      <!-- Ilustración personalizada -->
      <div class="relative mb-6">
        <div class="mx-auto w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </div>
        <!-- Elementos decorativos -->
        <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      
      <!-- Contenido principal -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2">¡Comienza a registrar tus gastos!</h3>
      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        Aún no tienes gastos registrados este mes. Agrega tu primer gasto para comenzar a llevar el control de tus finanzas.
      </p>
      
      <!-- Acciones sugeridas -->
      <div class="space-y-3">
        <button
          @click="$emit('add-expense')"
          class="inline-flex items-center px-6 py-3 sm:px-4 sm:py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg shadow-sm hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-95"
        >
          <svg class="w-5 h-5 mr-2 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Primer Gasto
        </button>
        
        <div class="text-sm text-gray-500">
          <p class="mb-2">💡 <strong>Tip:</strong> Puedes agregar gastos desde:</p>
          <ul class="text-xs space-y-1">
            <li>• El botón flotante en la esquina</li>
            <li>• El menú de navegación</li>
            <li>• Atajo de teclado: <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl + N</kbd></li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else :key="`expenses-list-${windowWidthTrigger}-${totalFiltered}`">
      <!-- Skeletons cuando se filtra -->
      <div v-if="isFiltering" class="space-y-3">
        <div v-for="i in 4" :key="i" class="p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 animate-pulse">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div class="flex-1 min-w-0">
                  <div class="h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                  <div class="h-3 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="h-4 w-16 bg-gray-200 rounded mb-2"></div>
              <div class="flex justify-end gap-2">
                <div class="h-8 w-8 bg-gray-200 rounded"></div>
                <div class="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contador y acción -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-2 space-y-2 sm:space-y-0" v-else>
        <span class="text-center sm:text-left">Mostrando {{ Math.min(shownCount, totalFiltered) }} de {{ totalFiltered }}</span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="inline-flex items-center justify-center gap-1 px-3 py-2 sm:px-3 sm:py-1.5 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:scale-105 active:scale-95"
          @click="clearAllFilters"
          title="Limpiar filtros"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Limpiar Filtros
        </button>
      </div>

      <!-- Lista agrupada por fecha -->
      <transition-group name="fade" tag="div" class="space-y-4" v-if="!isFiltering">
        <div v-for="group in groupedPagedExpenses" :key="group.key" class="space-y-2">
          <div class="sticky top-16 bg-white/70 backdrop-blur text-xs text-gray-600 font-medium px-1">{{ group.label }}</div>
          <ExpenseCard
            v-for="expense in group.items"
        :key="expense.id"
            :expense="expense"
            @edit="onEdit"
            @delete="onDelete"
          />
            </div>
      </transition-group>
      
      <!-- Estado vacío para búsquedas sin resultados -->
      <div v-if="!isFiltering && filteredExpenses.length === 0 && currentMonthExpenses.length > 0" class="text-center py-12 px-4">
        <!-- Ilustración de búsqueda -->
        <div class="relative mb-6">
          <div class="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
              </div>
          <!-- Elemento decorativo -->
          <div class="absolute -top-2 -right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                   </svg>
                 </div>
              </div>
        
        <!-- Contenido principal -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No se encontraron gastos</h3>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          No hay gastos que coincidan con los filtros aplicados. Intenta ajustar tu búsqueda o filtros.
        </p>
        
        <!-- Acciones sugeridas -->
        <div class="space-y-3">
                <button
            @click="clearAllFilters"
            class="inline-flex items-center px-6 py-3 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg shadow-sm hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:scale-95"
                >
            <svg class="w-5 h-5 mr-2 transition-transform duration-200 hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
            Limpiar Filtros
                </button>
          
          <div class="text-sm text-gray-500">
            <p class="mb-2">💡 <strong>Sugerencias:</strong></p>
            <ul class="text-xs space-y-1">
              <li>• Verifica la ortografía en la búsqueda</li>
              <li>• Prueba con términos más generales</li>
              <li>• Ajusta el rango de fechas</li>
              <li>• Cambia la categoría seleccionada</li>
            </ul>
              </div>
            </div>
          </div>
      
      <!-- Skeleton para cargar más -->
      <div v-if="loadingMore" class="mt-4 space-y-3">
        <div v-for="i in 3" :key="`loading-${i}`" class="p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 animate-pulse">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div class="flex-1 min-w-0">
                  <div class="h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                  <div class="h-3 w-1/2 bg-gray-200 rounded"></div>
        </div>
              </div>
            </div>
            <div class="text-right">
              <div class="h-4 w-16 bg-gray-200 rounded mb-2"></div>
              <div class="flex justify-end gap-2">
                <div class="h-8 w-8 bg-gray-200 rounded"></div>
                <div class="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Infinite Scroll System -->
    <div v-if="totalFiltered > 0 && !isFiltering" class="mt-6">
      <!-- Infinite Scroll Trigger -->
      <div 
        v-if="shownCount < totalFiltered"
        ref="infiniteScrollTrigger"
        class="flex items-center justify-center py-8"
      >
        <!-- Loading indicator -->
        <div v-if="loadingMore" class="flex items-center space-x-3 text-primary-600">
          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Cargando más gastos...</span>
        </div>
        
        <!-- Load more button (fallback for desktop) -->
        <button
          v-else-if="!loadingMore"
          class="hidden sm:inline-flex items-center justify-center px-6 py-3 rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loadingMore"
          @click="onLoadMore"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          Cargar más ({{ Math.min(pageSize, totalFiltered - shownCount) }} gastos)
        </button>
        
        <!-- Mobile hint -->
        <div v-else class="sm:hidden text-center text-gray-500 text-sm">
          <svg class="w-5 h-5 mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <p>Desliza hacia abajo para cargar más</p>
        </div>
      </div>
      
      <!-- End of list indicator -->
      <div v-else class="flex items-center justify-center py-8 text-gray-400">
        <div class="text-center">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm">Has visto todos los gastos</p>
        </div>
      </div>
    </div>

    <div v-if="filteredExpenses.length > 0 && !isFiltering" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <span class="text-sm font-medium text-gray-700 text-center sm:text-left">Total:</span>
        <span class="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-right">
          ${{ filteredTotalsSimple.totalAll.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
        </span>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs uppercase tracking-wide text-gray-500">Desglose</span>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Cargos crédito -->
          <div class="p-3 rounded-lg border border-purple-200 bg-purple-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
              <span class="text-xs text-purple-800">Cargos de crédito</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-purple-900">${{ filteredTotalsSimple.charges.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>

          <!-- Abonos pagados -->
          <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span class="text-xs text-emerald-800">Abonos pagados</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-emerald-900">${{ filteredTotalsSimple.paymentsPaid.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>

          <!-- Abonos pendientes -->
          <div class="p-3 rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <span class="text-xs text-amber-800">Abonos pendientes</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-amber-900">${{ filteredTotalsSimple.paymentsPending.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>

          <!-- Total sin abonos pendientes -->
          <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
              <span class="text-xs text-slate-800">Total sin abonos pendientes</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-slate-900">${{ filteredTotalsSimple.totalNet.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onUnmounted, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { notify } from '../services/notifications.js'
import { es } from 'date-fns/locale'
import { useExpenseStore } from '../stores/expenseStore'
import AppSelect from './ui/AppSelect.vue'
import { useConfirm } from '../composables/useConfirm'
import { parseLocalDate } from '../utils/date'
import ExpenseCard from './ExpenseCard.vue'
import { calculateExpensesTotal } from '../utils/expenseCalculations'
import DateRangePicker from './ui/DateRangePicker.vue'
import { useExpenseFilters } from '../composables/useExpenseFilters'

const expenseStore = useExpenseStore()
const confirm = useConfirm()
const emit = defineEmits(['edit-expense', 'delete-expense'])

// Usar el composable de filtros
const {
  // Estado
  searchQuery,
  searchInput,
  selectedCategoryId,
  selectedEntryType,
  selectedStatus,
  period,
  sortOrder,
  filtersExpanded,
  isFiltering,
  showRange,
  rangeBtnRef,
  rangeBtnRefMobile,
  rangeStart,
  rangeEnd,
  tempStart,
  tempEnd,
  rangeCursor,
  autoSingleDay,
  pageSize,
  shownCount,
  showSuggestions,
  searchSuggestions,
  searchInputRef,
  
  // Computeds
  rangeYear,
  rangeMonth,
  rangeMonthName,
  rangeLabel,
  categoryFilterOptions,
  typeOptions,
  statusFilterOptions,
  periodOptions,
  sortOptions,
  filteredExpenses,
  sortedExpenses,
  totalFiltered,
  pagedExpenses,
  groupedPagedExpenses,
  activeChips,
  hasActiveFilters,
  rangeCalendarDays,
  rangePickerStyle,
  
  // Funciones
  isCreditPayment,
  clearAllFilters,
  toggleRange,
  applyRange,
  clearRange,
  rangePrevMonth,
  rangeNextMonth,
  onPick,
  onPickWithAuto,
  applyPreset,
  applySearchNow,
  clearSearch
} = useExpenseFilters(expenseStore)

const currentMonthExpenses = computed(() => expenseStore.currentMonthExpenses)
const totalSpent = computed(() => expenseStore.totalSpent)
// Total de gastos filtrados usando función centralizada (excluye abonos automáticamente)
const filteredTotalAmount = computed(() => {
  return calculateExpensesTotal(filteredExpenses.value)
})

// Totales desglosados del conjunto filtrado (sin excluir nada para el total general)
const filteredTotals = computed(() => {
  const all = filteredExpenses.value
  let normal = 0
  let charges = 0
  let paymentsPaid = 0
  let paymentsPending = 0
  for (const e of all) {
    const credit = isCreditPayment(e)
    const type = String(e?.entryType || '').toLowerCase()
    const status = String(e?.status || '').toLowerCase()
    const amount = Number(e.amount) || 0
    if (!credit) {
      normal += amount
      continue
    }
    if (type === 'payment') {
      if (status === 'pending') paymentsPending += amount
      else paymentsPaid += amount
      continue
    }
    // Si es crédito y no es 'payment', contarlo como cargo
    charges += amount
  }
  const allTotal = normal + charges + paymentsPaid + paymentsPending
  return { all: allTotal, normal, charges, paymentsPaid, paymentsPending }
})

// Totales del periodo (ignorando filtros; respeta periodo/rango seleccionado)
const periodTotals = computed(() => {
  const base = baseByPeriodWithRange.value
  let normal = 0
  let charges = 0
  let paymentsPaid = 0
  let paymentsPending = 0
  for (const e of base) {
    const credit = isCreditPayment(e)
    const type = String(e?.entryType || '').toLowerCase()
    const status = String(e?.status || '').toLowerCase()
    const amount = Number(e.amount) || 0
    if (!credit) {
      normal += amount
      continue
    }
    if (type === 'payment') {
      if (status === 'pending') paymentsPending += amount
      else paymentsPaid += amount
      continue
    }
    charges += amount
  }
  const all = normal + charges + paymentsPaid + paymentsPending
  return { all, normal, charges, paymentsPaid, paymentsPending }
})

// Totales simples basados en el resultado filtrado (para mostrar lo pedido)
const filteredTotalsSimple = computed(() => {
  const all = filteredExpenses.value
  let charges = 0
  let paymentsPaid = 0
  let paymentsPending = 0
  for (const e of all) {
    const credit = isCreditPayment(e)
    const type = String(e?.entryType || '').toLowerCase()
    const status = String(e?.status || '').toLowerCase()
    const amount = Number(e.amount) || 0
    if (credit && type === 'payment') {
      if (status === 'pending') paymentsPending += amount
      else paymentsPaid += amount
    } else if (credit && type !== 'payment') {
      charges += amount
    }
  }
  const totalAll = all.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const totalNet = totalAll - paymentsPending
  return { totalAll, charges, paymentsPaid, paymentsPending, totalNet }
})
const loading = computed(() => expenseStore.loading)

// Cargar gastos fijos cuando se monta el componente
onMounted(async () => {
  // Initialize mobile detection
  isMobile.value = window.innerWidth < 640
  
  await expenseStore.loadFixedExpenses()
  // Setup infinite scroll después de que el DOM esté listo
  nextTick(() => {
    setupInfiniteScroll()
  })
  
  // Listener para cambios de tamaño de ventana
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 640
    setupInfiniteScroll()
    // Incrementar trigger para forzar re-render de la lista cuando cambia el tamaño
    windowWidthTrigger.value++
  })
})

// Limpiar scroll del body al desmontar
onUnmounted(() => {
  document.body.style.overflow = ''
  cleanupInfiniteScroll()
  window.removeEventListener('resize', setupInfiniteScroll)
})

// Variables específicas del componente (no están en el composable)

// Infinite scroll
const infiniteScrollTrigger = ref(null)
const intersectionObserver = ref(null)

// Pull-to-refresh
const pullToRefreshContainer = ref(null)
const isPulling = ref(false)
const pullDistance = ref(0)
const isRefreshing = ref(false)
const pullThreshold = 80
const maxPullDistance = 120
const pullStartY = ref(0)
const isMobile = ref(false)

// Trigger para forzar re-render cuando cambia el tamaño de pantalla
const windowWidthTrigger = ref(0)




const loadingMore = ref(false)
const onLoadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  // micro delay para ver spinner
  await new Promise(r => setTimeout(r, 350))
  shownCount.value = Math.min(shownCount.value + pageSize.value, totalFiltered.value)
  loadingMore.value = false
}

// Pull-to-refresh functions
const onPullStart = (e) => {
  if (!isMobile.value || window.scrollY > 0 || isRefreshing.value) return
  isPulling.value = true
  pullDistance.value = 0
  pullStartY.value = e.touches[0].clientY
}

const onPullMove = (e) => {
  if (!isMobile.value || !isPulling.value || isRefreshing.value) return
  
  const currentY = e.touches[0].clientY
  const deltaY = currentY - pullStartY.value
  
  if (deltaY > 0) {
    e.preventDefault()
    const distance = Math.min(deltaY, maxPullDistance)
    pullDistance.value = distance
  }
}

const onPullEnd = async () => {
  if (!isMobile.value || !isPulling.value || isRefreshing.value) return
  
  isPulling.value = false
  
  if (pullDistance.value >= pullThreshold) {
    await refreshData()
  }
  
  pullDistance.value = 0
}

const refreshData = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  
  try {
    // Recargar los gastos y categorías
    await Promise.all([
      expenseStore.loadExpenses(),
      expenseStore.loadCategories()
    ])
    
    // Reset pagination
    shownCount.value = pageSize.value
    
    // Small delay to show the refresh animation
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isRefreshing.value = false
  }
}

// Infinite scroll setup (solo para mobile)
const setupInfiniteScroll = () => {
  if (!infiniteScrollTrigger.value) return
  
  // Solo activar infinite scroll en mobile (< 640px)
  if (window.innerWidth >= 640) {
    cleanupInfiniteScroll()
    return
  }
  
  // Clean up existing observer
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }
  
  // Create new observer
  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && !loadingMore.value && shownCount.value < totalFiltered.value) {
        onLoadMore()
      }
    },
    {
      root: null,
      rootMargin: '100px', // Start loading 100px before the trigger is visible
      threshold: 0.1
    }
  )
  
  // Start observing
  intersectionObserver.value.observe(infiniteScrollTrigger.value)
}

// Clean up observer
const cleanupInfiniteScroll = () => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
    intersectionObserver.value = null
  }
}


// Funciones para búsqueda mejorada
const onSearchInput = () => {
  if (searchInput.value.length >= 2) {
    generateSuggestions()
  } else {
    searchSuggestions.value = []
  }
}

const generateSuggestions = () => {
  const query = searchInput.value.toLowerCase()
  const suggestions = new Set()
  
  // Buscar en descripciones de gastos
  expenseStore.currentMonthExpenses.forEach(expense => {
    if (expense.description.toLowerCase().includes(query)) {
      suggestions.add(expense.description)
    }
  })
  
  // Buscar en categorías
  expenseStore.activeCategories.forEach(category => {
    if (category.name.toLowerCase().includes(query)) {
      suggestions.add(category.name)
    }
  })
  
  // Convertir a array y limitar a 5 sugerencias
  searchSuggestions.value = Array.from(suggestions).slice(0, 5)
}

const selectSuggestion = (suggestion) => {
  searchInput.value = suggestion
  applySearchNow()
  showSuggestions.value = false
}

const hideSuggestions = () => {
  // Delay para permitir clicks en las sugerencias
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}



// Handlers
const onEdit = (expense) => emit('edit-expense', expense)
const onDelete = async (expense) => {
  const ok = await confirm.show({
    title: 'Eliminar gasto',
    message: '¿Eliminar este gasto? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'danger'
  })
  if (!ok) return
  try {
    await expenseStore.deleteExpense(expense.id)
    notify.success('Gasto eliminado')
  } catch (e) {
    notify.error('No se pudo eliminar el gasto')
  }
}


// Reconfigurar infinite scroll cuando cambien los filtros o la cantidad mostrada
watch([shownCount, totalFiltered], () => {
  nextTick(() => {
    setupInfiniteScroll()
  })
}, { flush: 'post' })

</script>
