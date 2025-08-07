<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained('user_entries')->onDelete('cascade'); // assuming 'user_entries' is the table for UserEntry model
            $table->text('comment');

            // ✅ Additional fields
            $table->string('role')->default('student');        // 'admin' or 'student'
            $table->boolean('status')->default(1);             // active by default
            $table->string('file')->nullable();                // store path to PDF/image file
            $table->string('ex1')->nullable();                 // extra 1
            $table->string('ex2')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
