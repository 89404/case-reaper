<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
    <div class="bg-surface p-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-6xl w-full">
      <img src="/logo.png" alt="Case Reaper" class="w-32 mb-6 drop-shadow-lg" />
      <h1 class="text-4xl font-extrabold mb-2 tracking-tight">Welkom bij Case Reaper</h1>
      <p class="mb-8 text-secondary text-center text-lg">Open CS2 cases, doe mee aan battles tegen andere spelers, en probeer je geluk met upgrades! Log in met Steam om te beginnen.</p>
      <div class="flex flex-col lg:flex-row gap-4 w-full">
        <NuxtLink to="/case-opener" class="bg-accent hover:bg-accent2 text-background font-bold py-4 px-6 rounded-lg text-lg transition text-center flex items-center justify-center flex-1">
          <img src="/cases/snakebite.png" alt="Case" class="w-6 h-6 mr-2" />
          Cases Openen
        </NuxtLink>
        <NuxtLink to="/case-battles" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition text-center flex items-center justify-center flex-1">
          <span class="mr-2">⚔️</span>
          Case Battle
        </NuxtLink>
        <NuxtLink to="/upgrade" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition text-center flex items-center justify-center flex-1">
          <span class="mr-2">⬆2X</span>
          Upgrader
        </NuxtLink>
        <NuxtLink to="/inventory" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition text-center flex items-center justify-center flex-1">
          <img src="/skins/ak_searingrage.png" alt="Skin" class="w-6 h-6 mr-2" />
          Inventory
        </NuxtLink>
        <NuxtLink to="/leaderboard" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition text-center flex items-center justify-center flex-1">
          <span class="mr-2">🏆</span>
          Leaderboard
        </NuxtLink>
      </div>
    </div>
    <footer class="mt-10 text-secondary text-sm opacity-60">Schoolproject &mdash; Niet geassocieerd met Valve of Steam</footer>
  </div>
</template>