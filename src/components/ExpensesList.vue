<template>
  <div class="card">
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
              v-if="showSuggestions && (searchSuggestions.length > 0 || quickFilters.length > 0)" 
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

              <!-- Filtros rápidos -->
              <div v-if="quickFilters.length > 0" class="p-2 border-t border-gray-100">
                <div class="text-xs font-medium text-gray-500 mb-2 px-2">Filtros rápidos</div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="filter in quickFilters"
                    :key="filter.key"
                    @click="applyQuickFilter(filter)"
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150"
                    :class="filter.active ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    <svg v-if="filter.icon" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="filter.icon" />
                    </svg>
                    {{ filter.label }}
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
            <!-- Filtros dentro del acordeón -->
            <div class="space-y-3">
              <!-- Categoría y Tipo -->
              <div class="grid grid-cols-1 gap-3">
        <div class="flex flex-col">
                  <label for="category-filter" class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <AppSelect
                    id="category-filter"
            v-model="selectedCategoryId"
            :options="categoryFilterOptions"
            placeholder="Todas las categorías"
            data-category-select
            class="h-10"
          />
        </div>
        <div class="flex flex-col">
                  <label for="type-filter" class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <AppSelect
                    id="type-filter"
            v-model="selectedEntryType"
            :options="typeOptions"
            placeholder="Todos"
            class="h-10"
          />
        </div>
              </div>

              <!-- Estado (cuando aplique) -->
              <div v-if="selectedEntryType === 'payment'" class="flex flex-col">
                <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <AppSelect
                  id="status-filter"
            v-model="selectedStatus"
            :options="statusFilterOptions"
            placeholder="Todos los estados"
            class="h-10"
          />
        </div>
              
              <!-- Periodo, Orden y Rango -->
              <div class="space-y-3">
                <div class="flex flex-col">
                  <label for="period-filter" class="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
                  <AppSelect
                    id="period-filter"
                    v-model="period"
                    :options="periodOptions"
                    placeholder="Mes actual"
                    class="h-10"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="sort-filter" class="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <AppSelect
                    id="sort-filter"
                    v-model="sortOrder"
                    :options="sortOptions"
                    placeholder="Más recientes primero"
                    class="h-10"
                  />
                </div>
                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Rango personalizado</label>
                  <button
                    ref="rangeBtnRef"
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

      <!-- Filtros normales (solo desktop) -->
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
          <label class="block text-sm font-medium text-gray-700 mb-2">Rango personalizado</label>
          <button
            ref="rangeBtnRef"
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

    <!-- Calendario de rango personalizado mejorado -->
    <Teleport to="body">
      <!-- Overlay solo en mobile -->
      <Transition
        enter-active-class="ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRange"
          class="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm sm:hidden"
          @click="showRange = false"
        ></div>
      </Transition>
      
      <Transition
        enter-active-class="ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showRange"
          class="fixed z-[70] bg-white rounded-xl shadow-2xl border border-gray-100 w-[320px] sm:w-[300px] sm:shadow-lg sm:border-gray-200"
          :style="rangePickerStyle"
          ref="rangePopoverRef"
          @click.stop
        >
          <!-- Header elegante -->
          <div class="bg-white border-b border-gray-100 px-3 py-2 sm:px-4 sm:py-3 rounded-t-xl">
            <div class="flex items-center justify-between">
              <h3 class="text-xs sm:text-sm font-semibold text-gray-900">Seleccionar rango de fechas</h3>
              <!-- Botón de cerrar solo en mobile -->
              <button
                @click="showRange = false"
                class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 sm:hidden"
              >
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
          </div>
          </div>

          <!-- Contenido del calendario -->
          <div class="p-3 sm:p-3">
            <!-- Presets mejorados -->
            <div class="mb-2 sm:mb-3">
              <div class="text-xs font-medium text-gray-500 mb-1.5 sm:mb-2">Rangos rápidos</div>
              <div class="flex flex-wrap gap-1.5 sm:gap-1.5">
                <button 
                  class="px-2 py-1 sm:px-2 sm:py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200" 
                  @click="applyPreset('today')"
                >
                  Hoy
            </button>
                <button 
                  class="px-2 py-1 sm:px-2 sm:py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200" 
                  @click="applyPreset('7')"
                >
                  7 días
                </button>
                <button 
                  class="px-2 py-1 sm:px-2 sm:py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200" 
                  @click="applyPreset('30')"
                >
                  30 días
                </button>
                <button 
                  class="px-2 py-1 sm:px-2 sm:py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200" 
                  @click="applyPreset('thisMonth')"
                >
                  Este mes
                </button>
                <button 
                  class="px-2 py-1 sm:px-2 sm:py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200" 
                  @click="applyPreset('lastMonth')"
                >
                  Mes anterior
            </button>
          </div>
          </div>

            <!-- Header del calendario -->
            <div class="flex items-center justify-between mb-1.5 sm:mb-2">
              <button 
                class="p-1.5 sm:p-1.5 rounded-md text-primary-700 hover:bg-primary-100 transition-colors duration-200" 
                @click="rangePrevMonth"
              >
                <svg class="h-3 w-3 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div class="text-xs sm:text-xs font-semibold text-gray-900">{{ rangeMonthName }} {{ rangeYear }}</div>
              <button 
                class="p-1.5 sm:p-1.5 rounded-md text-primary-700 hover:bg-primary-100 transition-colors duration-200" 
                @click="rangeNextMonth"
              >
                <svg class="h-3 w-3 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Días de la semana -->
            <div class="grid grid-cols-7 gap-1 mb-1 sm:mb-1">
              <div v-for="d in ['D','L','M','M','J','V','S']" :key="d" class="text-center py-1 sm:py-1 text-xs font-medium text-gray-500">
                {{ d }}
              </div>
            </div>

            <!-- Días del calendario -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="day in rangeCalendarDays"
              :key="day.date"
              @click="onPickWithAuto(day.date)"
              :class="[
                  'h-7 w-7 sm:h-7 sm:w-7 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40',
                  !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-primary-100',
                day.isInRange ? 'bg-primary-100 text-primary-900' : '',
                  day.isStart || day.isEnd ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' : ''
              ]"
            >
              {{ day.day }}
            </button>
          </div>
          </div>

          <!-- Footer con botones mejorados -->
          <div class="px-3 py-2 sm:px-3 sm:py-2 border-t border-gray-100 rounded-b-xl bg-gray-50">
            <div class="flex justify-between items-center">
              <button 
                class="px-3 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-xs text-gray-600 hover:text-gray-800 transition-colors duration-200" 
                @click="clearRange"
              >
                Limpiar
              </button>
              <button 
                class="px-4 py-1.5 sm:px-4 sm:py-1.5 text-xs sm:text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200" 
                @click="applyRange"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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

    <div v-else>
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

    <div v-if="totalFiltered > 0 && !isFiltering" class="mt-6">
      <div class="flex justify-center">
        <button
          v-if="shownCount < totalFiltered"
          class="inline-flex items-center justify-center px-6 py-3 sm:px-4 sm:py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[48px] sm:min-h-auto"
          :disabled="loadingMore"
          @click="onLoadMore"
        >
          <svg v-if="loadingMore" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="loadingMore" class="flex items-center text-sm sm:text-base">
            <span class="animate-pulse">Cargando más gastos...</span>
          </span>
          <span v-else class="flex items-center text-sm sm:text-base">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            Cargar más gastos
          </span>
        </button>
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

const expenseStore = useExpenseStore()
const confirm = useConfirm()
const emit = defineEmits(['edit-expense', 'delete-expense'])

const currentMonthExpenses = computed(() => expenseStore.currentMonthExpenses)
const totalSpent = computed(() => expenseStore.totalSpent)
const filteredTotalAmount = computed(() => {
  return filteredExpenses.value
    .filter(e => {
      const credit = isCreditPayment(e)
      if (!credit) return true
      const type = String(e?.entryType || '').toLowerCase()
      const status = String(e?.status || '').toLowerCase()
      if (type === 'payment') {
        return status !== 'pending'
      }
      // Si es crédito sin entryType o es 'charge', no impacta presupuesto
      return false
    })
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
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
  await expenseStore.loadFixedExpenses()
  // Inicializar filtros rápidos
  generateQuickFilters()
})

// Limpiar scroll del body al desmontar
onUnmounted(() => {
  document.body.style.overflow = ''
})

// Función para obtener el día del mes de un gasto fijo
// Identificar gasto de crédito (nuevo criterio: por debtId)
const isCreditPayment = (expense) => {
  if (expense?.debtId) return true
  // Backward compatibility por si hay datos antiguos en memoria
  const categoryName = expense.category?.name?.toLowerCase() || ''
  if (categoryName === 'crédito' || categoryName === 'credito') return true
  const description = expense.description?.toLowerCase() || ''
  if (description.includes('cuota') && (description.includes('crédito') || description.includes('credito'))) return true
  return false
}

// Estado de filtros y paginación
const searchQuery = ref('')
const selectedCategoryId = ref('')
const selectedEntryType = ref('') // '' | 'charge' | 'payment'
const selectedStatus = ref('') // '' | 'pending' | 'paid' (solo aplica si entryType === 'payment')
const period = ref('month') // month | 7 | 30 | all
const sortOrder = ref('desc') // desc | asc
const pageSize = ref(10)
const shownCount = ref(pageSize.value)

// Búsqueda mejorada con sugerencias
const showSuggestions = ref(false)
const searchSuggestions = ref([])
const quickFilters = ref([])


// Estado del acordeón de filtros (solo mobile)
const filtersExpanded = ref(false)

// reiniciar paginación cuando cambian filtros o query (señal de verdad)
watch([searchQuery, selectedCategoryId, selectedEntryType, selectedStatus, period, sortOrder], () => {
  shownCount.value = pageSize.value
  // Cerrar acordeón en mobile cuando se aplica un filtro
  if (window.innerWidth < 640) {
    filtersExpanded.value = false
  }
})

// Opciones para selects
const categoryFilterOptions = computed(() => [
  { label: 'Todas las categorías', value: '' },
  ...((expenseStore.activeCategories || []).map(c => ({ label: c.name, value: String(c.id) })))
])

const typeOptions = [
  { label: 'Todos', value: '' },
  { label: 'Cargos', value: 'charge' },
  { label: 'Abonos', value: 'payment' },
  { label: 'Créditos', value: 'credit' }
]

const statusFilterOptions = [
  { label: 'Todos', value: '' },
  { label: 'Pagado', value: 'paid' },
  { label: 'Pendiente', value: 'pending' }
]

const periodOptions = [
  { label: 'Mes actual', value: 'month' },
  { label: 'Últimos 7 días', value: '7' },
  { label: 'Últimos 30 días', value: '30' },
  { label: 'Todos', value: 'all' }
]

const sortOptions = [
  { label: 'Más recientes primero', value: 'desc' },
  { label: 'Más antiguos primero', value: 'asc' }
]

// Lista base por periodo
const baseByPeriod = computed(() => {
  const all = expenseStore.expenses || []
  const now = new Date()
  if (period.value === '7' || period.value === '30') {
    const days = Number(period.value)
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - days)
    return all.filter(e => parseLocalDate(e.date) >= cutoff)
  }
  if (period.value === 'all') return all
  // mes actual
  return currentMonthExpenses.value
})

// (Se redefine más abajo integrando rango personalizado)

// Ordenar y paginar
const sortedExpenses = computed(() => {
  return [...filteredExpenses.value].sort((a, b) => {
    const da = parseLocalDate(a.date).getTime()
    const db = parseLocalDate(b.date).getTime()
    return sortOrder.value === 'asc' ? da - db : db - da
  })
})

const totalFiltered = computed(() => sortedExpenses.value.length)
const pagedExpenses = computed(() => sortedExpenses.value.slice(0, shownCount.value))

const loadingMore = ref(false)
const onLoadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  // micro delay para ver spinner
  await new Promise(r => setTimeout(r, 350))
  shownCount.value = Math.min(shownCount.value + pageSize.value, totalFiltered.value)
  loadingMore.value = false
}

// Search helpers
const searchInputRef = ref(null)
const searchInput = ref('')
const searchDebounceMs = 400
let searchTimer = null

// Mantener searchQuery como fuente de verdad usada por filtros; searchInput es el campo UI
watch(() => searchInput.value, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = searchInput.value
  }, searchDebounceMs)
})

const applySearchNow = () => {
  clearTimeout(searchTimer)
  searchQuery.value = searchInput.value
}

const clearSearch = () => {
  searchInput.value = ''
  applySearchNow()
  showSuggestions.value = false
  // refocus for quick typing
  try { searchInputRef.value?.focus() } catch {}
}

// Funciones para búsqueda mejorada
const onSearchInput = () => {
  if (searchInput.value.length >= 2) {
    generateSuggestions()
  } else {
    searchSuggestions.value = []
  }
  generateQuickFilters()
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

const generateQuickFilters = () => {
  const filters = [
    {
      key: 'this-month',
      label: 'Este mes',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      active: period.value === 'month'
    },
    {
      key: 'last-week',
      label: 'Última semana',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      active: period.value === '7'
    },
    {
      key: 'fixed',
      label: 'Gastos fijos',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      active: false
    }
  ]
  
  // Agregar categorías populares
  const popularCategories = expenseStore.activeCategories.slice(0, 3)
  popularCategories.forEach(category => {
    filters.push({
      key: `category-${category.id}`,
      label: category.name,
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      active: selectedCategoryId.value === category.id.toString()
    })
  })
  
  quickFilters.value = filters
}

const selectSuggestion = (suggestion) => {
  searchInput.value = suggestion
  applySearchNow()
  showSuggestions.value = false
}

const applyQuickFilter = (filter) => {
  showSuggestions.value = false
  
  switch (filter.key) {
    case 'this-month':
      period.value = 'month'
      break
    case 'last-week':
      period.value = '7'
      break
    case 'fixed':
      // Filtrar solo gastos fijos
      searchInput.value = 'fijo'
      applySearchNow()
      break
    default:
      if (filter.key.startsWith('category-')) {
        const categoryId = filter.key.replace('category-', '')
        selectedCategoryId.value = categoryId
      }
      break
  }
}

const hideSuggestions = () => {
  // Delay para permitir clicks en las sugerencias
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}


// Chips activos
const activeChips = computed(() => {
  const chips = []
  if (searchQuery.value) chips.push({ key: 'q', label: `Búsqueda: "${searchQuery.value}"`, onClear: () => (searchQuery.value = '') })
  if (selectedCategoryId.value) {
    const cat = expenseStore.activeCategories.find(c => String(c.id) === String(selectedCategoryId.value))
    chips.push({ key: 'cat', label: `Categoría: ${cat ? cat.name : selectedCategoryId.value}`, onClear: () => (selectedCategoryId.value = '') })
  }
  if (selectedEntryType.value) {
    const map = { charge: 'Cargos', payment: 'Abonos', credit: 'Créditos' }
    chips.push({ key: 'type', label: `Tipo: ${map[selectedEntryType.value] || selectedEntryType.value}`, onClear: () => (selectedEntryType.value = '') })
  }
  if (selectedEntryType.value === 'payment' && selectedStatus.value) {
    const map = { paid: 'Pagado', pending: 'Pendiente' }
    chips.push({ key: 'status', label: `Estado: ${map[selectedStatus.value] || selectedStatus.value}`, onClear: () => (selectedStatus.value = '') })
  }
  if (period.value !== 'month') {
    const map = { '7': 'Últimos 7 días', '30': 'Últimos 30 días', all: 'Todos' }
    chips.push({ key: 'period', label: `Periodo: ${map[period.value] || 'Mes actual'}`, onClear: () => (period.value = 'month') })
  }
  if (sortOrder.value !== 'desc') chips.push({ key: 'sort', label: 'Orden: antiguos primero', onClear: () => (sortOrder.value = 'desc') })
  return chips
})

const hasActiveFilters = computed(() => activeChips.value.length > 0)

const clearAllFilters = () => {
  searchInput.value = ''
  searchQuery.value = ''
  selectedCategoryId.value = ''
  selectedEntryType.value = ''
  selectedStatus.value = ''
  period.value = 'month'
  sortOrder.value = 'desc'
  // limpiar rango personalizado
  rangeStart.value = null
  rangeEnd.value = null
  tempStart.value = null
  tempEnd.value = null
  showRange.value = false
}

// Estado de filtrado para mostrar skeletons breves
const isFiltering = ref(false)
let filterTimer = null
// micro skeleton al cambiar filtros
watch([searchQuery, selectedCategoryId, selectedEntryType, period, sortOrder], () => {
  isFiltering.value = true
  clearTimeout(filterTimer)
  filterTimer = setTimeout(() => {
    isFiltering.value = false
  }, 180)
})

// Rango de fechas elegante
const showRange = ref(false)
const rangeBtnRef = ref(null)
const rangePopoverRef = ref(null)
const rangeStart = ref(null) // Date|null
const rangeEnd = ref(null)   // Date|null
const tempStart = ref(null)
const tempEnd = ref(null)
const rangeCursor = ref(new Date())

const rangeYear = computed(() => rangeCursor.value.getFullYear())
const rangeMonth = computed(() => rangeCursor.value.getMonth())
const rangeMonthName = computed(() => format(new Date(rangeYear.value, rangeMonth.value, 1), 'MMMM', { locale: es }))

const autoSingleDay = ref(false)

const toggleRange = async () => {
  // Si vamos a abrir el popover, preseleccionar hoy si no hay rango previo
  if (!showRange.value) {
    // Bloquear scroll del body en todos los dispositivos
    document.body.style.overflow = 'hidden'
    
    if (!rangeStart.value && !rangeEnd.value) {
      const today = new Date()
      // Normalizar a medianoche
      const normalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      tempStart.value = normalized
      tempEnd.value = null
      rangeCursor.value = normalized
      autoSingleDay.value = true
    } else {
      tempStart.value = rangeStart.value
      tempEnd.value = rangeEnd.value
      // Centrar el cursor en el mes del inicio seleccionado
      if (tempStart.value) {
        rangeCursor.value = new Date(tempStart.value)
      }
      autoSingleDay.value = true
    }
  } else {
    // Restaurar scroll del body al cerrar
    document.body.style.overflow = ''
  }
  showRange.value = !showRange.value
}

const rangePickerStyle = computed(() => {
  if (!rangeBtnRef.value || !showRange.value) return {}
  const rect = rangeBtnRef.value.getBoundingClientRect()
  const calendarWidth = window.innerWidth < 640 ? 320 : 300
  const calendarHeight = window.innerWidth < 640 ? 400 : 280 // Más compacto en desktop
  
  // Centrar horizontalmente
  const left = Math.max(16, Math.min(rect.left, window.innerWidth - calendarWidth - 16))
  
  // En mobile: posicionar verticalmente - preferir arriba si hay espacio, sino abajo
  // En desktop: siempre abajo del botón
  let top
  if (window.innerWidth < 640) {
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom
    top = spaceAbove > calendarHeight + 16 
      ? rect.top - calendarHeight - 8  // Arriba del botón
      : rect.bottom + 8  // Abajo del botón
  } else {
    // En desktop: siempre justo debajo del botón
    top = rect.bottom + 4
  }
  
  return { 
    top: `${Math.max(16, Math.min(top, window.innerHeight - calendarHeight - 16))}px`, 
    left: `${left}px` 
  }
})

const rangePrevMonth = () => {
  const d = new Date(rangeCursor.value)
  d.setMonth(d.getMonth() - 1)
  rangeCursor.value = d
}
const rangeNextMonth = () => {
  const d = new Date(rangeCursor.value)
  d.setMonth(d.getMonth() + 1)
  rangeCursor.value = d
}

const rangeCalendarDays = computed(() => {
  const y = rangeYear.value
  const m = rangeMonth.value
  const first = new Date(y, m, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const isCurrentMonth = d.getMonth() === m
    const inRange = tempStart.value && tempEnd.value && d >= tempStart.value && d <= tempEnd.value
    const isStart = tempStart.value && d.toDateString() === tempStart.value.toDateString()
    const isEnd = tempEnd.value && d.toDateString() === tempEnd.value.toDateString()
    days.push({
      date: new Date(d),
      day: d.getDate(),
      isCurrentMonth,
      isInRange: !!inRange,
      isStart: !!isStart,
      isEnd: !!isEnd
    })
  }
  return days
})

// Presets de rango
const applyPreset = (preset) => {
  const today = new Date()
  const startOf = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
  const endOf = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)

  let start = null
  let end = null

  if (preset === '7') {
    end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    start = new Date(end)
    start.setDate(end.getDate() - 6)
  } else if (preset === '30') {
    end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    start = new Date(end)
    start.setDate(end.getDate() - 29)
  } else if (preset === 'thisMonth') {
    start = startOf(today)
    end = endOf(today)
  } else if (preset === 'lastMonth') {
    const last = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    start = startOf(last)
    end = endOf(last)
  } else if (preset === 'today') {
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    end = start
  }

  tempStart.value = start
  tempEnd.value = end
  applyRange()
}

const onPick = (date) => {
  if (!tempStart.value || (tempStart.value && tempEnd.value)) {
    tempStart.value = new Date(date)
    tempEnd.value = null
    return
  }
  // picking end
  if (new Date(date) < tempStart.value) {
    tempEnd.value = tempStart.value
    tempStart.value = new Date(date)
  } else {
    tempEnd.value = new Date(date)
  }
}

const onPickWithAuto = (date) => {
  const picked = new Date(date)
  // Auto-aplicar solo si había un inicio ya seleccionado y coincide con el clic,
  // y el modo autoSingleDay está activo (primer clic tras abrir)
  if (autoSingleDay.value && tempStart.value && !tempEnd.value && picked.toDateString() === tempStart.value.toDateString()) {
    applyRange()
    autoSingleDay.value = false
    return
  }
  // Comportamiento normal de selección (inicio/fin)
  onPick(date)
  // Tras cualquier selección manual, desactivar auto-aplicación
  autoSingleDay.value = false
}

const clearRange = () => {
  tempStart.value = null
  tempEnd.value = null
  showRange.value = false
  // Restaurar scroll del body
  document.body.style.overflow = ''
}

const applyRange = () => {
  // Permitir selección de un solo día: si no hay fin, usar el inicio como fin
  if (tempStart.value && !tempEnd.value) {
    rangeStart.value = tempStart.value
    rangeEnd.value = tempStart.value
  } else {
    rangeStart.value = tempStart.value
    rangeEnd.value = tempEnd.value
  }
  showRange.value = false
  // Restaurar scroll del body
  document.body.style.overflow = ''
}

// Cerrar al hacer clic fuera o con Escape
const onGlobalPointerDown = (event) => {
  if (!showRange.value) return
  const target = event.target
  const pop = rangePopoverRef.value
  const btn = rangeBtnRef.value
  if ((pop && pop.contains(target)) || (btn && btn.contains(target))) return
  showRange.value = false
  // Restaurar scroll del body
  document.body.style.overflow = ''
}

const onGlobalKeyDown = (event) => {
  if (!showRange.value) return
  if (event.key === 'Escape') {
    showRange.value = false
    // Restaurar scroll del body
    document.body.style.overflow = ''
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onGlobalPointerDown)
  document.addEventListener('keydown', onGlobalKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onGlobalPointerDown)
  document.removeEventListener('keydown', onGlobalKeyDown)
})

const rangeLabel = computed(() => {
  if (rangeStart.value && rangeEnd.value) {
    const sameDay = rangeStart.value.toDateString() === rangeEnd.value.toDateString()
    if (sameDay) return `${format(rangeStart.value, 'dd/MM/yyyy')}`
    return `${format(rangeStart.value, 'dd/MM/yyyy')} - ${format(rangeEnd.value, 'dd/MM/yyyy')}`
  }
  if (rangeStart.value && !rangeEnd.value) {
    return `${format(rangeStart.value, 'dd/MM/yyyy')}`
  }
  return 'Rango personalizado'
})

// Aplicar rango al filtrar (admite un solo día)
watch([rangeStart, rangeEnd], () => {
  if (rangeStart.value) {
    period.value = 'custom'
  } else if (!rangeStart.value && !rangeEnd.value && period.value === 'custom') {
    period.value = 'month'
  }
  shownCount.value = pageSize.value
})

// Integrar rango en baseByPeriod
const _baseByPeriodOrig = baseByPeriod
const baseByPeriodWithRange = computed(() => {
  // si hay rango, priorizarlo; si solo hay inicio, usarlo como fin también
  if (period.value === 'custom' && rangeStart.value) {
    const all = expenseStore.expenses || []
    const start = rangeStart.value
    const end = rangeEnd.value || rangeStart.value
    return all.filter(e => {
      const d = parseLocalDate(e.date)
      return d >= start && d <= end
    })
  }
  return _baseByPeriodOrig.value
})

// Reemplazar usos siguientes
const filteredExpenses = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const cat = selectedCategoryId.value
  return baseByPeriodWithRange.value.filter(e => {
    const matchesCat = !cat || String(e.categoryId) === String(cat)
    const matchesSearch = !query || (e.description || '').toLowerCase().includes(query)
    const matchesType = !selectedEntryType.value
      || (selectedEntryType.value === 'credit' ? isCreditPayment(e) : (String(e.entryType || '').toLowerCase() === selectedEntryType.value))
    const matchesStatus = !(selectedEntryType.value === 'payment' && selectedStatus.value)
      || (String(e.status || '').toLowerCase() === selectedStatus.value)
    return matchesCat && matchesSearch && matchesType && matchesStatus
  })
})

// Agrupar por fecha (día)
const groupedPagedExpenses = computed(() => {
  const groups = {}
  for (const e of pagedExpenses.value) {
    const d = parseLocalDate(e.date)
    const key = format(d, 'yyyy-MM-dd')
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  return Object.keys(groups)
    .sort((a, b) => (sortOrder.value === 'asc' ? a.localeCompare(b) : b.localeCompare(a)))
    .map(key => ({
      key,
      label: format(parseLocalDate(key), 'EEEE d \"de\" MMMM', { locale: es }),
      items: groups[key]
    }))
})

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


// Resetear estado si el tipo ya no es "payment"
watch(() => selectedEntryType.value, (val) => {
  if (val !== 'payment') selectedStatus.value = ''
})

// Funciones expuestas para el componente padre
const expandFiltersAndFocusCategory = () => {
  // Expandir filtros en mobile si están colapsados
  filtersExpanded.value = true
  // Scroll hacia arriba para mostrar los filtros
  nextTick(() => {
    // Scroll suave hacia el área de filtros
    const filtersSection = document.getElementById('filters-section')
    if (filtersSection) {
      filtersSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
    // Focus en el select de categoría después del scroll
    setTimeout(() => {
      const categorySelect = document.querySelector('[data-category-select]')
      if (categorySelect) {
        categorySelect.focus()
      }
    }, 500) // Esperar a que termine el scroll
  })
}

const expandFiltersAndOpenDateRange = () => {
  // Expandir filtros en mobile si están colapsados
  filtersExpanded.value = true
  // Scroll hacia arriba para mostrar los filtros
  nextTick(() => {
    // Scroll suave hacia el área de filtros
    const filtersSection = document.getElementById('filters-section')
    if (filtersSection) {
      filtersSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
    // Abrir el calendario de rango después del scroll
    setTimeout(() => {
      showRange.value = true
    }, 500) // Esperar a que termine el scroll
  })
}

// Exponer funciones al componente padre
defineExpose({
  expandFiltersAndFocusCategory,
  expandFiltersAndOpenDateRange
})
</script>
