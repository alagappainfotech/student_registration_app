from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Reset the database by clearing all data while preserving the schema'

    def handle(self, *args, **options):
        self.stdout.write('Resetting database...')
        
        # Disable foreign key checks temporarily
        with connection.cursor() as cursor:
            cursor.execute('PRAGMA foreign_keys = OFF;')
            
            # Get all tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            
            # Delete data from all tables except sqlite_sequence
            for table in tables:
                if table != 'sqlite_sequence':
                    try:
                        cursor.execute(f'DELETE FROM "{table}";')
                        self.stdout.write(f'  - Cleared data from {table}')
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f'  - Could not clear {table}: {str(e)}'))
            
            # Reset auto-increment counters
            cursor.execute('DELETE FROM sqlite_sequence;')
            
            # Re-enable foreign key checks
            cursor.execute('PRAGMA foreign_keys = ON;')
        
        self.stdout.write(self.style.SUCCESS('Database reset completed successfully!'))
