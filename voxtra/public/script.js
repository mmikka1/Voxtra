// VoXtra - Основной JavaScript код
ACCOUNT_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

class VoXtraApp {
    constructor() {
        this.currentTrackType = null;
        this.currentProject = null;
        this.audioContext = null;
        this.isInitialized = false;

        this.init();
    }

    init() {
        localStorage.setItem("voxtra_party_id", null);

        document.addEventListener("DOMContentLoaded", () => {
            // ▼▼▼ ДОБАВЬ ЭТОТ БЛОК ПОСЛЕ addEventListener ▼▼▼
            // Трекинг при закрытии страницы
            window.addEventListener("beforeunload", () => {
                this.trackEvent("app_close");
            });

            this.setupEventListeners();
            this.initializeAudio();
            this.animateOnScroll();
            this.setupAdvancedControls(); // ← ДОБАВЬ ЭТУ СТРОЧКУ
            this.showWelcomeToast();
            // ▼▼▼ ДОБАВЬ ЭТИ ДВЕ СТРОЧКИ ▼▼▼
            this.trackEvent("app_start");
        });
    }

    // Инициализация Web Audio API
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (error) {
            console.warn("Web Audio API не поддерживается:", error);
        }
    }

    // Настройка всех обработчиков событий
    setupEventListeners() {
        // Навигация
        const createProjectBtn = document.getElementById("createProjectBtn");
        if (createProjectBtn) {
            createProjectBtn.addEventListener("click", () => {
                fetch(`/projects/?account_id=${ACCOUNT_ID}`, {
                    method: "POST"
                }).then(response => {
                    response.json().then(project => {
                        console.log(project);
                        localStorage.setItem('voxtra_project_id', project.id);
                        this.showPage("trackTypePage");
                        this.playNavigationSound();
                    })
                })
            });
            // В setupEventListeners добавь:
            const statsBtn = document.getElementById("statsBtn");
            if (statsBtn) {
                statsBtn.addEventListener("click", () => {
                    this.showStatsPage();
                });
            }
        }

        // Выбор типа партии
        document.querySelectorAll(".track-type-card").forEach((card) => {
            card.addEventListener("click", (e) => {
                const trackType = e.currentTarget.dataset.type;
                this.selectTrackType(trackType, e.currentTarget);
                this.playClickSound();
            });
        });

        // Кнопка генерации
        const generateBtn = document.getElementById("generateTrackBtn");
        if (generateBtn) {
            generateBtn.addEventListener("click", () => {
                this.generateTrack();
            });
        }

        // Кнопки на странице результата
        const downloadBtn = document.getElementById("downloadBtn");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                this.downloadTrack();
            });
        }

        const newProjectBtn = document.getElementById("newProjectBtn");
        if (newProjectBtn) {
            newProjectBtn.addEventListener("click", () => {
                this.showPage("trackTypePage");
                this.playNavigationSound();
            });
        }

        const saveProjectBtn = document.getElementById("saveProjectBtn");
        if (saveProjectBtn) {
            saveProjectBtn.addEventListener("click", () => {
                this.saveProject();
            });
        }

        // Обработка ввода промпта
        this.setupPromptInput();

        // Обработчики для примеров промптов
        document.querySelectorAll(".example").forEach((example) => {
            example.addEventListener("click", (e) => {
                this.fillPrompt(e.currentTarget);
                this.playClickSound();
            });
        });
        const libraryBtn = document.getElementById("libraryBtn");
        if (libraryBtn) {
            libraryBtn.addEventListener("click", async () => {
                this.showPage("libraryPage");
                await this.renderProjectsLibrary(); // Обновляем библиотеку при переходе
            });
        }
        this.setupAdvancedControls();
    }

    // Настройка текстового поля промпта
    setupPromptInput() {
        const promptInput = document.getElementById("promptInput");
        if (!promptInput) return;

        const counter = document.createElement("div");
        counter.className = "prompt-length";
        counter.textContent = "0/500";
        promptInput.parentNode.appendChild(counter);

        promptInput.addEventListener("input", (e) => {
            const length = e.target.value.length;
            counter.textContent = length + "/500";

            // Изменение цвета в зависимости от длины
            if (length < 30) {
                counter.className = "prompt-length warning";
                promptInput.style.borderColor = "#e74c3c";
            } else if (length < 100) {
                counter.className = "prompt-length medium";
                promptInput.style.borderColor = "#f39c12";
            } else {
                counter.className = "prompt-length success";
                promptInput.style.borderColor = "#27ae60";
            }

            // Анимация при достижении хорошей длины
            if (length > 50 && length < 150) {
                promptInput.style.transform = "scale(1.01)";
                setTimeout(() => {
                    promptInput.style.transform = "scale(1)";
                }, 150);
            }
        });

        // Эффект фокуса
        promptInput.addEventListener("focus", () => {
            promptInput.parentElement.classList.add("focused");
        });

        promptInput.addEventListener("blur", () => {
            promptInput.parentElement.classList.remove("focused");
        });
    }

    // Переключение между страницами
    showPage(pageId) {
        // Анимация исчезновения текущей страницы
        if (pageId != "promptPage"){
            localStorage.setItem("voxtra_party_id", null);
        }

        const currentActive = document.querySelector(".page.active");
        if (currentActive) {
            currentActive.style.opacity = "0";
            currentActive.style.transform = "translateY(20px)";

            setTimeout(() => {
                // Скрываем все страницы
                document.querySelectorAll(".page").forEach((page) => {
                    page.classList.remove("active");
                    page.style.opacity = "0";
                    page.style.transform = "translateY(20px)";
                });

                // Показываем нужную страницу
                const targetPage = document.getElementById(pageId);
                if (targetPage) {
                    targetPage.classList.add("active");

                    // Анимация появления
                    setTimeout(() => {
                        targetPage.style.opacity = "1";
                        targetPage.style.transform = "translateY(0)";
                        this.animatePageElements(targetPage);
                    }, 50);
                }
            }, 300);
        } else {
            // Первый запуск
            document.querySelectorAll(".page").forEach((page) => {
                page.classList.remove("active");
            });
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add("active");
            }
        }

        // Прокрутка наверх
        window.scrollTo(0, 0);
    }

    // Выбор типа партии
    selectTrackType(trackType, element) {
        this.currentTrackType = trackType;

        // Анимация выбора
        document.querySelectorAll(".track-type-card").forEach((card) => {
            card.classList.remove("selected");
        });
        element.classList.add("selected");

        // Обновляем информацию на странице промпта
        const trackInfo = this.getTrackInfo(trackType);
        const selectedTrackIcon = document.getElementById("selectedTrackIcon");
        const selectedTrackName = document.getElementById("selectedTrackName");
        const promptTitle = document.getElementById("promptTitle");

        if (selectedTrackIcon) selectedTrackIcon.textContent = trackInfo.icon;
        if (selectedTrackName) selectedTrackName.textContent = trackInfo.name;
        if (promptTitle)
            promptTitle.textContent = "Опиши " + trackInfo.name.toLowerCase();

        // Обновляем placeholder в текстовом поле
        const promptInput = document.getElementById("promptInput");
        if (promptInput) {
            promptInput.placeholder = this.getPromptPlaceholder(trackType);
        }

        // Переходим на страницу промпта с анимацией
        setTimeout(() => {
            this.showPage("promptPage");
        }, 400);
    }

    // Заполнение примера промпта
    fillPrompt(exampleElement) {
        const promptInput = document.getElementById("promptInput");
        if (!promptInput) return;

        promptInput.value = exampleElement.textContent;
        promptInput.focus();

        // Анимация заполнения
        promptInput.style.backgroundColor = "rgba(102, 126, 234, 0.1)";
        setTimeout(() => {
            promptInput.style.backgroundColor = "";
        }, 1000);
    }
    async generateTrack() {
        const promptInput = document.getElementById("promptInput");
        if (!promptInput) return;

        const prompt = promptInput.value.trim();
        const genreSelect = document.getElementById("genreSelect");
        const moodSelect = document.getElementById("moodSelect");
        const tempoSelect = document.getElementById("tempoSelect");

        const genre = genreSelect ? genreSelect.value : "";
        const mood = moodSelect ? moodSelect.value : "";
        const tempo = tempoSelect ? tempoSelect.value : "";

        // Валидация
        if (!prompt) {
            this.showToast(
                "📝 Пожалуйста, опиши партию которую хочешь создать!",
                "warning"
            );
            this.shakeElement(promptInput);
            return;
        }

        if (prompt.length < 10) {
            this.showToast(
                "❌ Слишком короткое описание. Напиши хотя бы 10 символов.",
                "warning"
            );
            return;
        }

        const generateBtn = document.getElementById("generateTrackBtn");
        if (!generateBtn) return;

        // Показываем индикатор загрузки
        this.showLoadingState(generateBtn, "🎵 Создаю партию...");

        // ▼▼▼ ДОБАВЬ ЭТОТ БЛОК ПЕРЕД try ▼▼▼
        // Добавь трекинг генерации:
        this.trackEvent("generation_start", {
            trackType: this.currentTrackType,
            promptLength: prompt.length,
            genre: genre,
            mood: mood,
            tempo: tempo,
        });

        try {
            // Используем AI для генерации
            const party = await this.generateWithAI();

            const result = {
                trackType: this.currentTrackType,
                prompt: party.description,
                genre: party.genre,
                mood: party.mood,
                tempo: party.tempo,
                audioUrl: party.audio_path,
                duration: "0:30",
                bpm: tempo === "slow" ? 80 : tempo === "fast" ? 140 : 120,
            };

            // Обновляем страницу результата
            this.updateResultPage(result);

            // Переходим на страницу результата
            this.showPage("resultPage");

            // ▼▼▼ ДОБАВЬ ЭТУ СТРОЧКУ ПЕРЕД showToast ▼▼▼
            // Трекинг успешной генерации
            this.trackEvent("generation_success", {
                trackType: this.currentTrackType,
                duration: result.duration,
            });

            this.showToast("🎉 Партия успешно создана!", "success");
        } catch (error) {
            // ▼▼▼ ДОБАВЬ ЭТОТ БЛОК В catch ▼▼▼
            // Трекинг ошибки генерации
            this.trackEvent("generation_error", {
                trackType: this.currentTrackType,
                error: error.message,
            });

            this.showToast(
                "❌ Ошибка при создании партии. Попробуй еще раз.",
                "error"
            );
            console.error("Generation error:", error);
        } finally {
            this.hideLoadingState(generateBtn, "🎵 Создать партию");
        }
    }

    // Обновление страницы результата
    updateResultPage(result) {
        const trackInfo = this.getTrackInfo(result.trackType);

        // Обновляем информацию о треке
        const resultTrackIcon = document.getElementById("resultTrackIcon");
        const resultTrackName = document.getElementById("resultTrackName");
        const resultTrackDescription = document.getElementById(
            "resultTrackDescription"
        );

        if (resultTrackIcon) resultTrackIcon.textContent = trackInfo.icon;
        if (resultTrackName) resultTrackName.textContent = trackInfo.name;
        if (resultTrackDescription) {
            resultTrackDescription.textContent =
                result.prompt.length > 100
                    ? result.prompt.substring(0, 100) + "..."
                    : result.prompt;
        }

        // Устанавливаем аудио
        const audioElement = document.getElementById("resultAudio");
        if (audioElement) {
            audioElement.src = result.audioUrl;

            // Добавляем метаданные
            const metadata = document.createElement("div");
            metadata.className = "track-metadata";
            metadata.innerHTML =
                '<div class="metadata-item">' +
                "<strong>Жанр:</strong> " +
                (this.getGenreName(result.genre) || "Не указан") +
                "</div>" +
                '<div class="metadata-item">' +
                "<strong>Настроение:</strong> " +
                (this.getMoodName(result.mood) || "Не указано") +
                "</div>" +
                '<div class="metadata-item">' +
                "<strong>Темп:</strong> " +
                result.bpm +
                " BPM" +
                "</div>";

            const existingMetadata =
                audioElement.parentElement.querySelector(".track-metadata");
            if (existingMetadata) {
                existingMetadata.remove();
            }
            audioElement.parentElement.appendChild(metadata);
        }
    }

    // Скачивание трека
    downloadTrack() {
        const audioElement = document.getElementById("resultAudio");
        if (!audioElement) return;

        const trackInfo = this.getTrackInfo(this.currentTrackType);

        // Создаем временную ссылку для скачивания
        const link = document.createElement("a");
        link.href = audioElement.src;
        link.download = "VoXtra_" + trackInfo.name + "_" + Date.now() + ".mp3";

        // Анимация скачивания
        this.showToast("📥 Начинаем скачивание...", "success");

        setTimeout(() => {
            link.click();
            this.showToast("✅ Файл скачан успешно!", "success");
        }, 1000);
    }

    // Сохранение проекта
    saveProject() {
        const promptInput = document.getElementById("promptInput");
        const genreSelect = document.getElementById("genreSelect");
        const moodSelect = document.getElementById("moodSelect");
        const tempoSelect = document.getElementById("tempoSelect");
        const audioElement = document.getElementById("resultAudio");

        if (!promptInput || !audioElement) return;

        const prompt = promptInput.value;
        const genre = genreSelect ? genreSelect.value : "";
        const mood = moodSelect ? moodSelect.value : "";
        const tempo = tempoSelect ? tempoSelect.value : "";

        const projectData = {
            id: Date.now(),
            trackType: this.currentTrackType,
            prompt: prompt,
            genre: genre,
            mood: mood,
            tempo: tempo,
            timestamp: new Date().toLocaleString("ru-RU"),
            audioUrl: audioElement.src,
        };

        // Сохраняем в localStorage
        const projects = JSON.parse(
            localStorage.getItem("voxtra_projects") || "[]"
        );
        projects.push(projectData);
        localStorage.setItem("voxtra_projects", JSON.stringify(projects));

        this.showToast("💾 Проект сохранен в библиотеку!", "success");

        // Анимация успешного сохранения
        const saveBtn = document.getElementById("saveProjectBtn");
        if (saveBtn) {
            saveBtn.textContent = "✅ Сохранено!";
            setTimeout(() => {
                saveBtn.textContent = "💾 Сохранить проект";
            }, 2000);
        }
    }

    // Вспомогательные методы
    getTrackInfo(trackType) {
        const trackTypes = {
            drums: { icon: "🥁", name: "Барабанная партия" },
            vocal: { icon: "🎤", name: "Вокальная партия" },
            guitar: { icon: "🎸", name: "Гитарная партия" },
            bass: { icon: "🎸", name: "Бас-партия" },
            keys: { icon: "🎹", name: "Партия клавишных" },
            strings: { icon: "🎻", name: "Струнная партия" },
        };

        return (
            trackTypes[trackType] || { icon: "🎵", name: "Музыкальная партия" }
        );
    }

    getPromptPlaceholder(trackType) {
        const placeholders = {
            drums: 'Например: "Мощная рок-барабанная партия с акцентами на малом барабане и частым хэтом..."',
            vocal: 'Например: "Эмоциональный вокал в стиле поп-баллады с мягким вибрато и высокими нотами в припеве..."',
            guitar: 'Например: "Энергичный гитарный рифф в стиле хард-рок с пауэр-аккордами и быстрыми пассажами..."',
            bass: 'Например: "Фанковая бас-линия с слайдами и синкопами, подчеркивающая ритм..."',
            keys: 'Например: "Нежные арпеджио на пианино с добавлением струнных падов в фоновом режиме..."',
            strings:
                'Например: "Драматичная струнная аранжировка с виолончельным соло и скрипичными гармониями..."',
        };

        return (
            placeholders[trackType] ||
            "Опиши подробно, какую партию ты хочешь создать..."
        );
    }

    getGenreName(genre) {
        const genres = {
            rock: "Рок",
            pop: "Поп",
            jazz: "Джаз",
            electronic: "Электроника",
            hiphop: "Хип-хоп",
            classical: "Классика",
        };
        return genres[genre];
    }

    getMoodName(mood) {
        const moods = {
            happy: "Веселое",
            energetic: "Энергичное",
            calm: "Спокойное",
            sad: "Грустное",
            epic: "Эпическое",
        };
        return moods[mood];
    }

    // Анимации и визуальные эффекты
    animateOnScroll() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0) scale(1)";
                    }
                });
            },
            { threshold: 0.1 }
        );

        document
            .querySelectorAll(".feature-card, .track-type-card, .card")
            .forEach((el) => {
                el.style.opacity = "0";
                el.style.transform = "translateY(30px) scale(0.95)";
                el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                observer.observe(el);
            });
    }

    animatePageElements(page) {
        const elements = page.querySelectorAll(
            ".feature-card, .track-type-card, .card, .control-group"
        );
        elements.forEach((el, index) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(20px)";
            el.style.transition =
                "opacity 0.5s ease " +
                index * 0.1 +
                "s, transform 0.5s ease " +
                index * 0.1 +
                "s";

            setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            }, 50);
        });
    }

    showLoadingState(button, text) {
        button.innerHTML = text;
        button.disabled = true;
        button.classList.add("loading");
    }

    hideLoadingState(button, text) {
        button.innerHTML = text;
        button.disabled = false;
        button.classList.remove("loading");
    }

    shakeElement(element) {
        element.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => {
            element.style.animation = "";
        }, 500);
    }

    // Уведомления
    showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = "toast " + type;
        toast.innerHTML =
            '<span class="toast-icon">' +
            this.getToastIcon(type) +
            "</span>" +
            '<span class="toast-message">' +
            message +
            "</span>";
        document.body.appendChild(toast);

        // Анимация появления
        setTimeout(() => toast.classList.add("show"), 100);

        // Автоматическое скрытие
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    getToastIcon(type) {
        const icons = {
            success: "✅",
            error: "❌",
            warning: "⚠️",
            info: "💡",
        };
        return icons[type] || "💡";
    }

    // Звуковые эффекты
    playNavigationSound() {
        if (!this.isInitialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 523.25;
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                0.1,
                this.audioContext.currentTime + 0.1
            );
            gainNode.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 0.3
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn("Не удалось воспроизвести звук:", error);
        }
    }

    playClickSound() {
        if (!this.isInitialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 659.25;
            oscillator.type = "triangle";

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                0.05,
                this.audioContext.currentTime + 0.05
            );
            gainNode.gain.linearRampToValueAtTime(
                0,
                this.audioContext.currentTime + 0.2
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn("Не удалось воспроизвести звук клика:", error);
        }
    }

    showWelcomeToast() {
        setTimeout(() => {
            this.showToast(
                "🎵 Добро пожаловать в VoXtra! Создай свою первую музыкальную партию.",
                "info"
            );
        }, 1000);
    }
    // === ДОБАВЬ ЭТИ МЕТОДЫ В КЛАСС VoXtraApp ===

    // Метод для сохранения проекта
    async saveProject() {
        const promptInput = document.getElementById("promptInput");
        const genreSelect = document.getElementById("genreSelect");
        const moodSelect = document.getElementById("moodSelect");
        const tempoSelect = document.getElementById("tempoSelect");
        const audioElement = document.getElementById("resultAudio");

        if (!promptInput || !audioElement) return;

        const prompt = promptInput.value;
        const genre = genreSelect ? genreSelect.value : "";
        const mood = moodSelect ? moodSelect.value : "";
        const tempo = tempoSelect ? tempoSelect.value : "";

        const projectData = {
            id: "project_" + Date.now(),
            trackType: this.currentTrackType,
            prompt: prompt,
            genre: genre,
            mood: mood,
            tempo: tempo,
            timestamp: new Date().toISOString(),
            audioUrl: audioElement.src,
            duration: "0:30",
            bpm: tempo === "slow" ? 80 : tempo === "fast" ? 140 : 120,
        };

        // Сохраняем в localStorage
        this.saveProjectToStorage(projectData);

        this.showToast("💾 Проект сохранен в библиотеку!", "success");

        // Обновляем кнопку
        const saveBtn = document.getElementById("saveProjectBtn");
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = "✅ Сохранено!";
            setTimeout(() => {
                saveBtn.textContent = originalText;
            }, 2000);
        }

        // Обновляем отображение библиотеки
        await this.renderProjectsLibrary();
    }

    // Сохранение в localStorage
    saveProjectToStorage(projectData) {
        try {
            const projects = JSON.parse(
                localStorage.getItem("voxtra_projects") || "[]"
            );
            projects.unshift(projectData); // Добавляем в начало

            // Ограничиваем количество проектов (последние 50)
            const limitedProjects = projects.slice(0, 50);
            localStorage.setItem(
                "voxtra_projects",
                JSON.stringify(limitedProjects)
            );

            return true;
        } catch (error) {
            console.error("Ошибка сохранения проекта:", error);
            this.showToast("❌ Ошибка при сохранении проекта", "error");
            return false;
        }
    }

    // Загрузка проектов по API
    async loadProjectsFromAPI() {
        const account = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

        try {
            const response = await fetch(`/projects/my?account_id=${account}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error("Ошибка загрузки проектов:", error);
            return [];
        }
    }

    // Отрисовка библиотеки проектов
    async renderProjectsLibrary() {
        const projectsGrid = document.getElementById("projectsGrid");
        const emptyLibrary = document.getElementById("emptyLibrary");
        const totalProjects = document.getElementById("totalProjects");
        const recentProjects = document.getElementById("recentProjects");

        if (!projectsGrid || !emptyLibrary) return;

        const data = await this.loadProjectsFromAPI();
        const projects = data.projects;
        console.log(data);
        // Обновляем статистику
        if (totalProjects) totalProjects.textContent = projects.length;

        // Считаем проекты за последнюю неделю
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentCount = data.last_week_projects;

        if (recentProjects) recentProjects.textContent = recentCount;

        // Если проектов нет - показываем пустое состояние
        if (projects.length === 0) {
            projectsGrid.style.display = "none";
            emptyLibrary.style.display = "block";
            return;
        }

        // Показываем сетку проектов
        projectsGrid.style.display = "grid";
        emptyLibrary.style.display = "none";
        projectsGrid.innerHTML = "";

        projects.forEach((project, ind) => {
            projectsGrid.innerHTML += `
                <div class="title">    
                    <h5>Проект №${ind + 1}</h5>
                </div>        
            `;
            const projectContainer = document.createElement("div");
            projectContainer.className = "projects-grid"

            project.musicparties.forEach((part) => {
                const trackInfo = this.getTrackInfo(part.type);
                const projectDate = new Date(part.created_at).toLocaleDateString(
                    "ru-RU"
                );

                const projectCard = document.createElement("div");
                projectCard.className = "project-card";
                projectCard.innerHTML = `
                    <div class="project-header">
        <div class="project-icon">${trackInfo.icon}</div>
                        <div class="project-info">
                            <h3>${trackInfo.name}</h3>
                            <p class="project-description">${this.truncateText(
                                part.description,
                                80
                            )}</p>
                            <div class="project-meta">
                                <span>📅 ${projectDate}</span>
                                <span>🎵 ${
                                    this.getGenreName(part.genre) || "Без жанра"
                                }</span>
                                <span>⏱️ ${30}</span>
                            </div>
                        </div>
                    </div>
                    
                    <audio class="project-audio" controls>
                        <source src="${part.audio_path}" type="audio/mpeg">
                        Ваш браузер не поддерживает аудио элемент.
                    </audio>
                    
                    <div class="project-actions">
                        <button class="btn-play" onclick="voxTraApp.playProject(this)">
                            ▶ Воспроизвести
                        </button>
                        <button class="btn-edit" onclick="voxTraApp.editProject('${project.id}', '${part.id}')">
                            ✏️ Редактировать
                        </button>
                        <button class="btn-delete" onclick="voxTraApp.deleteProject('${
                            part.id
                        }')">
                            🗑️ Удалить
                        </button>
                    </div>
                `;
                projectContainer.appendChild(projectCard);
            })
            projectsGrid.appendChild(projectContainer);
        });
    }

    // Воспроизведение проекта
    playProject(elem) {
        // Находим аудио элемент в карточке и воспроизводим
        const audioElement = elem.closest(".project-card").querySelector("audio");
        if (audioElement) {
            audioElement.play().catch((error) => {
                console.error("Ошибка воспроизведения:", error);
                this.showToast("❌ Ошибка воспроизведения аудио", "error");
            });
        }
        this.showToast("🎵 Воспроизводим проект...", "info");
    }

    // Редактирование проекта
    editProject(projectId, partId) {
        fetch(`/musicparties/${partId}`).then(response => {
            response.json().then(party => {
                // Загружаем данные проекта в форму
                this.currentTrackType = party.type;

                localStorage.setItem("voxtra_project_id", projectId);
                localStorage.setItem("voxtra_party_id", partId);

                const trackInfo = this.getTrackInfo(party.type);
                document.getElementById("selectedTrackIcon").textContent =
                    trackInfo.icon;
                document.getElementById("selectedTrackName").textContent =
                    trackInfo.name;

                document.getElementById("promptInput").value = party.description;

                if (party.genre) {
                    const genreSelect = document.getElementById("genreSelect");
                    if (genreSelect) genreSelect.value = party.genre;
                }

                if (party.mood) {
                    const moodSelect = document.getElementById("moodSelect");
                    if (moodSelect) moodSelect.value = party.mood;
                }

                // Переходим на страницу промпта
                this.showPage("promptPage");
                this.showToast("📝 Редактируем проект...", "info");
            })
        })
    }

    // Удаление проекта
    async deleteProject(projectId) {
        if (confirm("Вы уверены, что хотите удалить этот проект?")) {
            await fetch(`/musicparties/${projectId}`, {
                method: "DELETE",
            })

            await this.renderProjectsLibrary();
            this.showToast("🗑️ Проект удален", "success");
        }
    }

    // Вспомогательная функция для обрезки текста
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }
    // === ДОБАВЬ В КЛАСС VoXtraApp ===

    getPromptData() {
        const description = document.getElementById("promptInput").value.trim();
        const genre = document.getElementById("genreSelect").value;
        const mood = document.getElementById("moodSelect").value;
        const tempo = document.getElementById("tempoSelect").value;

        return {
            description,
            genre,
            mood,
            tempo
        };
    }

    // Основной метод генерации с AI
    async generateWithAI() {
        try {
            this.showToast("🎵 Генерирую музыку с помощью AI...", "info");
            const project_id = localStorage.getItem("voxtra_project_id");
            // Пробуем разные API по очереди
            // Сначала пробуем локальный MusicGen (если доступен)
            const party = await this.tryLocalMusicGen();

            return party;
        } catch (error) {
            console.error("AI генерация не удалась:", error);
            this.showToast(
                "❌ Ошибка генерации. Используем демо-трек.",
                "error"
            );

        }
    }

    // Пробуем локальный MusicGen
    async tryLocalMusicGen() {
        try {
            const data = this.getPromptData();
            console.log(data);
            const projectId = localStorage.getItem("voxtra_project_id");
            const partyId = localStorage.getItem("voxtra_party_id");
            console.log(projectId);
            console.log(this.currentTrackType);
            // Проверяем доступен ли локальный сервер MusicGen
            let response;
            if (partyId == undefined || partyId == null){
                response = await fetch("/musicparties", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        description: data.description,
                        project_id: projectId,
                        type: this.currentTrackType,
                        genre: data.genre,
                        mood: data.mood,
                        tempo: data.tempo,
                    }),
                });
            } else{
                response = await fetch("/musicparties", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        description: data.description,
                        party_id: partyId,
                        project_id: projectId,
                        type: this.currentTrackType,
                        genre: data.genre,
                        mood: data.mood,
                        tempo: data.tempo,
                    }),
                });
            }

            if (response.ok) {
                const partyId = localStorage.setItem("voxtra_party_id", null);
                const musicparty = await response.json();
                console.log(musicparty);
                return musicparty;
            }
        } catch (error) {
            console.log("Локальный MusicGen недоступен:", error.message);
        }
        return null;
    }

    setupAdvancedControls() {
        // Слайдер длительности
        const durationSlider = document.getElementById("durationSlider");
        const durationValue = document.getElementById("durationValue");

        if (durationSlider && durationValue) {
            durationSlider.addEventListener("input", () => {
                durationValue.textContent = durationSlider.value;
            });
        }

        // Слайдер творчества
        const creativitySlider = document.getElementById("creativitySlider");
        const creativityValue = document.getElementById("creativityValue");

        if (creativitySlider && creativityValue) {
            creativitySlider.addEventListener("input", () => {
                creativityValue.textContent = creativitySlider.value;
            });
        }
    }
    // === ДОБАВЬ В КЛАСС VoXtraApp ===

    trackEvent(eventName, data = {}) {
        const analytics = JSON.parse(
            localStorage.getItem("voxtra_analytics") || "{}"
        );

        if (!analytics.events) {
            analytics.events = [];
        }

        analytics.events.push({
            name: eventName,
            data: data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
        });

        // Сохраняем только последние 1000 событий
        if (analytics.events.length > 1000) {
            analytics.events = analytics.events.slice(-1000);
        }

        localStorage.setItem("voxtra_analytics", JSON.stringify(analytics));
    }

    getStats() {
        const analytics = JSON.parse(
            localStorage.getItem("voxtra_analytics") || "{}"
        );
        const projects = this.loadProjectsFromStorage();

        return {
            totalProjects: projects.length,
            totalGenerations: analytics.events
                ? analytics.events.filter((e) => e.name === "generation").length
                : 0,
            favoriteInstrument: this.getFavoriteInstrument(projects),
            mostUsedGenre: this.getMostUsedGenre(projects),
            totalUsageTime: this.calculateUsageTime(analytics),
        };
    }

    getFavoriteInstrument(projects) {
        const instruments = {};
        projects.forEach((project) => {
            instruments[project.trackType] =
                (instruments[project.trackType] || 0) + 1;
        });

        return Object.keys(instruments).reduce(
            (a, b) => (instruments[a] > instruments[b] ? a : b),
            "drums"
        );
    }

    getMostUsedGenre(projects) {
        const genres = {};
        projects.forEach((project) => {
            if (project.genre) {
                genres[project.genre] = (genres[project.genre] || 0) + 1;
            }
        });

        return Object.keys(genres).reduce(
            (a, b) => (genres[a] > genres[b] ? a : b),
            "Не указан"
        );
    }

    calculateUsageTime(analytics) {
        if (!analytics.events) return "0 минут";

        const sessions = [];
        let currentSession = null;

        analytics.events.forEach((event) => {
            if (event.name === "app_start") {
                if (currentSession) sessions.push(currentSession);
                currentSession = {
                    start: new Date(event.timestamp),
                    end: null,
                };
            } else if (event.name === "app_close" && currentSession) {
                currentSession.end = new Date(event.timestamp);
                sessions.push(currentSession);
                currentSession = null;
            }
        });

        const totalMs = sessions.reduce((total, session) => {
            const end = session.end || new Date();
            return total + (end - session.start);
        }, 0);

        const minutes = Math.round(totalMs / 60000);
        return minutes > 60
            ? "${Math.round(minutes / 60)} часов ${minutes % 60} минут"
            : "${minutes} минут";
    }
    // === ДОБАВЬ В КЛАСС VoXtraApp ===

    showStatsPage() {
        this.showPage("statsPage");
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const stats = this.getStats();

        // Обновляем элементы статистики
        const elements = {
            statTotalProjects: stats.totalProjects,
            statTotalGenerations: stats.totalGenerations,
            statUsageTime: stats.totalUsageTime,
            statFavoriteInstrument: this.getTrackInfo(stats.favoriteInstrument)
                .name,
            statPopularGenre:
                this.getGenreName(stats.mostUsedGenre) || stats.mostUsedGenre,
        };

        Object.keys(elements).forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });

        // Обновляем иконку любимого инструмента
        const favoriteIcon = document.getElementById("statFavoriteIcon");
        if (favoriteIcon) {
            favoriteIcon.textContent = this.getTrackInfo(
                stats.favoriteInstrument
            ).icon;
        }
    }

    exportStats() {
        const stats = this.getStats();
        const analytics = JSON.parse(
            localStorage.getItem("voxtra_analytics") || "{}"
        );
        const projects = this.loadProjectsFromStorage();

        const exportData = {
            stats: stats,
            analytics: analytics,
            projects: projects.map((p) => ({
                id: p.id,
                type: p.trackType,
                prompt: p.prompt,
                timestamp: p.timestamp,
            })),
            exportDate: new Date().toISOString(),
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(dataBlob);
        link.download = "voxtra_stats_${Date.now()}.json";
        link.click();

        this.showToast("📊 Статистика экспортирована", "success");
    }

    clearStats() {
        if (
            confirm(
                "Вы уверены, что хотите очистить всю статистику? Это действие нельзя отменить."
            )
        ) {
            localStorage.removeItem("voxtra_analytics");
            this.showToast("🗑️ Статистика очищена", "success");
            this.updateStatsDisplay();
        }
    }
}

// Добавляем CSS анимации динамически
const style = document.createElement("style");
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .loading {
        position: relative;
        overflow: hidden;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    .toast {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: rgba(255, 255, 255, 0.95);
        color: #2d3436;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transform: translateX(400px);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast.success {
        border-left: 4px solid #27ae60;
    }
    
    .toast.error {
        border-left: 4px solid #e74c3c;
    }
    
    .toast.warning {
        border-left: 4px solid #f39c12;
    }
    
    .toast.info {
        border-left: 4px solid #3498db;
    }
    
    .track-type-card.selected {
        border-color: #667eea !important;
        background: rgba(102, 126, 234, 0.15) !important;
        transform: scale(1.05);
    }
    
    .prompt-length {
        position: absolute;
        bottom: -25px;
        right: 10px;
        font-size: 0.8rem;
        transition: color 0.3s ease;
    }
    
    .prompt-length.warning { color: #e74c3c; }
    .prompt-length.medium { color: #f39c12; }
    .prompt-length.success { color: #27ae60; }
    
    .track-metadata {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        font-size: 0.9rem;
    }
    
    .metadata-item {
        margin-bottom: 0.5rem;
    }
    
    .metadata-item:last-child {
        margin-bottom: 0;
    }
`;

document.head.appendChild(style);

// Инициализация приложения
const voxTraApp = new VoXtraApp();

// Глобальные функции для HTML onclick атрибутов
function showPage(pageId) {
    voxTraApp.showPage(pageId);
}

function fillPrompt(element) {
    voxTraApp.fillPrompt(element);
}
