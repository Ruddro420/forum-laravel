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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('sub_category_id')->nullable()->constrained('sub_categories')->onDelete('cascade');
            $table->longText('details')->nullable();
            $table->string('tag')->nullable();
            $table->foreignId('student_id')->default(1)->constrained('user_entries')->onDelete('cascade');
            $table->enum('status', ['active', 'inactive', 'pending'])->default('active');
            $table->string('file')->nullable(); // PDF, image, or video file
            $table->string('post_img')->nullable(); // Image thumbnail
            $table->string('ex1')->nullable();
            $table->string('ex2')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
