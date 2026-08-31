use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create habit and habit_log tables",
            sql: include_str!("../migrations/0001_init.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add hora and duracion_minutos to habit",
            sql: include_str!("../migrations/0002_add_hora_duracion.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add setting key-value table",
            sql: include_str!("../migrations/0003_add_settings.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add habit_period_claim table",
            sql: include_str!("../migrations/0004_add_xp_claims.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add color and importancia to habit",
            sql: include_str!("../migrations/0005_add_color_importancia.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "add habit_schedule_block table",
            sql: include_str!("../migrations/0006_add_habit_schedule_blocks.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "add habit_log_tombstone table for cross-device sync",
            sql: include_str!("../migrations/0007_add_sync_tombstones.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:habit-tracker.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
