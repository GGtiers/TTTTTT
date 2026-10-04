
// ========================================
// GGtiers - GŁÓWNY SKRYPT
// ========================================


// ========================================
// RENDEROWANIE IKON
// ========================================

function renderModeIcon(icon) {

    if (
        typeof icon === "string" &&
        (
            icon.endsWith(".png") ||
            icon.endsWith(".jpg") ||
            icon.endsWith(".jpeg") ||
            icon.endsWith(".webp") ||
            icon.endsWith(".svg")
        )
    ) {

        return `
            <img
                src="${icon}"
                class="mode-icon-image"
                alt=""
            >
        `;

    }

    return icon || "";

}


// ========================================
// POBIERANIE GRACZY Z API
// ========================================

let players = [];

const API_URL = "http://hel1.lvlhost.pl:30000";


async function loadPlayers() {

    try {

        const response = await fetch(
            `${API_URL}/api/players`
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        players = data.map(player => {

            const minecraft =
                player.minecraft || null;


            /*
             * Minecraft:
             *
             * minecraft.username
             * minecraft.uuid
             *
             * Skin jest pobierany bezpośrednio
             * przez MC-Heads na podstawie UUID.
             */


            const minecraftUsername =
    minecraft?.username ||
    null;

let skinHead = null;

if (minecraftUsername) {

    skinHead =
        `https://mc-heads.net/head/${encodeURIComponent(minecraftUsername)}/32`;
} 


            /*
             * Fallback:
             * jeżeli UUID nie istnieje,
             * używamy starego headUrl z API.
             */


            if (
                !skinHead &&
                minecraft?.headUrl
            ) {

                skinHead =
                    minecraft.headUrl;

            }


            return {

                id:
                    player.discordId ||
                    player.id ||
                    null,


                name:
                    minecraft?.username ||
                    player.name ||
                    player.discordName ||
                    "Unknown",


                discordName:
                    player.discordName ||
                    player.name ||
                    "Unknown",


                minecraft:
                    minecraft,


minecraftUsername:
    minecraftUsername,


                skin:
                    minecraft?.skinUrl ||
                    null,


                head:
                    skinHead,


                avatar:
                    minecraft?.avatarUrl ||
                    null,


                body:
                    minecraft?.bodyUrl ||
                    null,


                subhuman:
                    player.subhuman ??
                    false,


                tiers: {

                    Sword:
                        player.sword ??
                        null,

                    Crystal:
                        player.crystal ??
                        null,

                    NPot:
                        player.npot ??
                        null,

                    Axe:
                        player.axe ??
                        null,

                    Mace:
                        player.mace ??
                        null,

                    UHC:
                        player.uhc ??
                        null,

                    Gildie:
                        player.gildie ??
                        null,

                    Podziemia:
                        player.podziemia ??
                        null,

                    SMP:
                        player.smp ??
                        null

                }

            };

        });


        normalizePlayers();

        showAllPlayers();

        showPlayerProfile();


    } catch (error) {

        console.error(
            "Nie udało się pobrać graczy:",
            error
        );


        const tierlist =
            document.getElementById(
                "tierlist"
            );


        if (tierlist) {

            tierlist.innerHTML = `

                <div style="
                    padding: 30px;
                    text-align: center;
                    color: #ff7777;
                ">

                    Nie udało się pobrać danych GGtiers.

                </div>

            `;

        }

    }

}


// ========================================
// UZUPEŁNIANIE DANYCH
// ========================================

function normalizePlayers() {

    players.forEach(player => {

        if (!player.tiers) {

            player.tiers = {};

        }


        GGtiersConfig.modes.forEach(mode => {

            if (
                player.tiers[mode.id] ===
                undefined
            ) {

                player.tiers[mode.id] = null;

            }

        });


        if (
            typeof player.subhuman !==
            "boolean"
        ) {

            player.subhuman = false;

        }

    });

}


// ========================================
// WARTOŚĆ TIERU
// ========================================

function getTierPoints(tierId) {

    const tier =
        GGtiersConfig.tiers.find(
            tier =>
                tier.id === tierId
        );


    return tier
        ? tier.points
        : 0;

}


// ========================================
// OVERALL
// ========================================

function getOverall(player) {

    if (
        !player ||
        player.subhuman
    ) {

        return 0;

    }


    let overall = 0;


    GGtiersConfig.modes.forEach(mode => {

        overall += getTierPoints(
            player.tiers[mode.id]
        );

    });


    return overall;

}


// ========================================
// SORTOWANIE
// ========================================

function getSortedPlayers() {

    return [...players].sort(
        (a, b) => {

            if (
                a.subhuman &&
                !b.subhuman
            ) {

                return 1;

            }


            if (
                !a.subhuman &&
                b.subhuman
            ) {

                return -1;

            }


            return (
                getOverall(b) -
                getOverall(a)
            );

        }
    );

}


// ========================================
// KLASA TIERU
// ========================================

function getTierClass(tier) {

    return tier
        ? "tier-" +
          tier.toLowerCase()
        : "";

}


// ========================================
// AVATAR / SKIN GRACZA
// ========================================

function renderPlayerSkin(
    player,
    className = "player-skin"
) {

    if (
        !player ||
        !player.head
    ) {

        return "";

    }


    return `

        <img
            src="${player.head}"
            class="${className}"
            alt="${player.name}"
            loading="lazy"
        >

    `;

}


// ========================================
// GŁÓWNA TIERLISTA
// ========================================

function showAllPlayers() {

    const tierlist =
        document.getElementById(
            "tierlist"
        );


    if (!tierlist) {

        return;

    }


    tierlist.style.setProperty(
        "--mode-count",
        GGtiersConfig.modes.length
    );


    tierlist.innerHTML = "";


    const sortedPlayers =
        getSortedPlayers();


    // ====================================
    // NAGŁÓWEK
    // ====================================

    let headerHTML = `

        <div class="all-players-header">

            <strong>#</strong>

            <strong>Gracz</strong>

            <strong>Overall</strong>

    `;


    GGtiersConfig.modes.forEach(mode => {

        headerHTML += `

            <strong>
                ${renderModeIcon(mode.icon)}
                ${mode.name}
            </strong>

        `;

    });


    headerHTML += `</div>`;


    tierlist.innerHTML +=
        headerHTML;


    // ====================================
    // GRACZE
    // ====================================

    sortedPlayers.forEach(
        (player, index) => {

            const place =
                index + 1;


            const skinHTML =
                renderPlayerSkin(
                    player
                );


            let rowHTML = `

                <div class="all-players-row">

                    <span class="player-place">
                        ${place}
                    </span>


                    <a
                        href="player.html?name=${encodeURIComponent(player.name)}"
                        class="player-name"
                    >

                        ${skinHTML}

                        <span class="player-name-text">

                            ${player.name}

                            ${
                                player.subhuman

                                    ? `
                                        <span class="subhuman-badge">
                                            SUBHUMAN
                                        </span>
                                      `

                                    : ""
                            }

                        </span>

                    </a>


                    <span class="player-overall">

                        ${
                            player.subhuman

                                ? "-"

                                : getOverall(player)

                        }

                    </span>

            `;


            GGtiersConfig.modes.forEach(mode => {

                const tier =
                    player.tiers[mode.id];


                const displayTier =
                    tier || "-";


                rowHTML += `

                    <span
                        class="
                            player-tier
                            ${getTierClass(tier)}
                        "
                    >

                        ${displayTier}

                    </span>

                `;

            });


            rowHTML += `</div>`;


            tierlist.innerHTML +=
                rowHTML;

        }
    );

}


// ========================================
// WYSZUKIWANIE - ENTER
// ========================================

const playerSearch =
    document.getElementById(
        "playerSearch"
    );


if (playerSearch) {

    playerSearch.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            const searchText =
                playerSearch.value.trim();


            if (
                searchText === ""
            ) {

                return;

            }


            const player =
                players.find(
                    player =>
                        player.name
                            .toLowerCase() ===
                        searchText
                            .toLowerCase()
                );


            if (!player) {

                alert(
                    "Nie znaleziono gracza: " +
                    searchText
                );

                return;

            }


            openPlayerModal(player);

        }
    );

}


// ========================================
// MODAL GRACZA
// ========================================

function openPlayerModal(player) {

    const modal =
        document.getElementById(
            "playerModal"
        );


    const playerName =
        document.getElementById(
            "modalPlayerName"
        );


    const playerInfo =
        document.getElementById(
            "modalPlayerInfo"
        );


    if (
        !modal ||
        !playerName ||
        !playerInfo
    ) {

        return;

    }


    const sortedPlayers =
        getSortedPlayers();


    const place =
        sortedPlayers.indexOf(player) +
        1;


    const overall =
        getOverall(player);


    playerName.innerHTML = `

        ${renderPlayerSkin(
            player,
            "modal-player-skin"
        )}

        <span>

            ${player.name}

            <span class="modal-place">
                #${place}
            </span>

            ${
                player.subhuman

                    ? `
                        <span class="subhuman-badge">
                            SUBHUMAN
                        </span>
                      `

                    : ""
            }

        </span>

    `;


    playerInfo.innerHTML = `

        <div class="modal-tier">

            <strong>
                Overall
            </strong>

            <span>

                ${
                    player.subhuman
                        ? "-"
                        : overall + " pkt"
                }

            </span>

        </div>

    `;


    GGtiersConfig.modes.forEach(mode => {

        const tier =
            player.tiers[mode.id];


        playerInfo.innerHTML += `

            <div class="modal-tier">

                <strong>

                    ${renderModeIcon(mode.icon)}

                    ${mode.name}

                </strong>


                <span
                    class="
                        modal-tier-value
                        ${getTierClass(tier)}
                    "
                >

                    ${tier || "-"}

                </span>

            </div>

        `;

    });


    modal.classList.add("show");

}


// ========================================
// ZAMYKANIE MODALA
// ========================================

const closePlayerModal =
    document.getElementById(
        "closePlayerModal"
    );


if (closePlayerModal) {

    closePlayerModal.addEventListener(
        "click",
        function () {

            const modal =
                document.getElementById(
                    "playerModal"
                );


            if (modal) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ========================================
// PROFIL GRACZA
// ========================================

function showPlayerProfile() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const playerName =
        params.get("name");


    if (!playerName) {

        return;

    }


    const player =
        players.find(
            player =>
                player.name
                    .toLowerCase() ===
                playerName
                    .toLowerCase()
        );


    if (!player) {

        const nameElement =
            document.getElementById(
                "playerName"
            );


        if (nameElement) {

            nameElement.textContent =
                "Nie znaleziono gracza.";

        }


        return;

    }


    const sortedPlayers =
        getSortedPlayers();


    const place =
        sortedPlayers.indexOf(player) +
        1;


    const nameElement =
        document.getElementById(
            "playerName"
        );


    const placeElement =
        document.getElementById(
            "playerPlace"
        );


    const overallElement =
        document.getElementById(
            "playerOverall"
        );


    if (nameElement) {

        nameElement.textContent =
            player.name;

    }


    if (placeElement) {

        placeElement.textContent =
            "#" + place;

    }


    if (overallElement) {

        overallElement.textContent =
            player.subhuman
                ? "-"
                : getOverall(player);

    }


    // ====================================
    // SKIN NA STRONIE PROFILU
    // ====================================

    const profileSkin =
        document.getElementById(
            "playerSkin"
        );


    if (
        profileSkin &&
        player.head
    ) {

        profileSkin.src =
            player.head;

        profileSkin.alt =
            player.name;

        profileSkin.style.display =
            "block";

    }


    GGtiersConfig.modes.forEach(mode => {

        const element =
            document.getElementById(
                "player" + mode.id
            );


        if (!element) {

            return;

        }


        const tier =
            player.tiers[mode.id];


        element.textContent =
            tier || "-";


        element.classList.add(
            getTierClass(tier)
        );

    });

}


// ========================================
// START
// ========================================

loadPlayers();

